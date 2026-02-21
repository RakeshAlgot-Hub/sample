from fastapi import APIRouter, HTTPException, status, Depends
from app.utils.helpers import get_current_user
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime,timezone

router = APIRouter()

@router.put("/units/{unit_id}", status_code=status.HTTP_200_OK)
async def update_unit_endpoint(unit_id: str, data: dict, current_user=Depends(get_current_user)):
    units_collection = db["units"]
    update_fields = {}
    if "status" in data:
        update_fields["status"] = data["status"]
    if "currentTenantId" in data:
        update_fields["currentTenantId"] = data["currentTenantId"]
    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    update_fields["updatedAt"] = datetime.now(timezone.utc)
    result = await units_collection.update_one({"_id": ObjectId(unit_id)}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    return {"success": True, "updated": update_fields}
