from app.database.mongodb import db
from fastapi import APIRouter, status, HTTPException, Depends
from app.utils.helpers import get_current_user
from app.services.unit_service import create_units_service
from bson import ObjectId
from typing import Optional
from fastapi import Query
router = APIRouter()

# Bulk create units endpoint for UI
@router.post("/units/bulk", status_code=status.HTTP_201_CREATED)
async def create_units_bulk_endpoint(data: dict, current_user=Depends(get_current_user)):
    # expects: propertyId, buildingId, floorId, roomId, noOfBeds
    required = ["propertyId", "buildingId", "floorId", "roomId", "noOfBeds"]
    if not all(k in data for k in required):
        raise HTTPException(status_code=400, detail="Missing required fields for bulk unit creation")
    units = await create_units_service(
        propertyId=data["propertyId"],
        buildingId=data["buildingId"],
        floorId=data["floorId"],
        roomId=data["roomId"],
        num_beds=int(data["noOfBeds"])
    )
    if not units:
        raise HTTPException(status_code=400, detail="Units could not be created")
    return units



@router.get("/units", status_code=status.HTTP_200_OK)
async def get_units(
    propertyId: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    buildingId: Optional[str] = Query(None),
    roomId: Optional[str] = Query(None),
    current_user=Depends(get_current_user)
):
    units_collection = db["units"]
    buildings_collection = db["properties"]
    rooms_collection = db["rooms"]
    query = {"propertyId": propertyId}
    if status:
        query["status"] = status
    if buildingId:
        query["buildingId"] = buildingId
    if roomId:
        query["roomId"] = roomId
    if search:
        query["$or"] = [
            {"bedNumber": {"$regex": search, "$options": "i"}},
        ]
    total = await units_collection.count_documents(query)
    cursor = units_collection.find(query).skip((page - 1) * limit).limit(limit)
    units = []
    building_name_map = {}
    room_number_map = {}
    async for unit in cursor:
        unit["id"] = str(unit["_id"])
        unit.pop("_id", None)
        # Get building name
        b_id = unit.get("buildingId")
        name = None
        if b_id and b_id not in building_name_map:
            prop = await buildings_collection.find_one({"_id": ObjectId(propertyId)})
            if prop and "buildings" in prop:
                for b in prop["buildings"]:
                    if (b.get("id") or b.get("_id")) == b_id:
                        name = b.get("name")
                        break
            building_name_map[b_id] = name or b_id
        unit["buildingName"] = building_name_map.get(b_id, b_id)
        # Get room number
        r_id = unit.get("roomId")
        if r_id and r_id not in room_number_map:
            room = await rooms_collection.find_one({"_id": ObjectId(r_id)})
            room_number_map[r_id] = room["roomNumber"] if room and "roomNumber" in room else r_id
        unit["roomNumber"] = room_number_map.get(r_id, r_id)
        units.append(unit)
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": units
    }