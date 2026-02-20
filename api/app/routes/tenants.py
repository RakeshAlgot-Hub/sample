from fastapi import APIRouter, HTTPException, status
from app.database.mongodb import db
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/tenants", status_code=status.HTTP_201_CREATED)
async def create_tenant_endpoint(tenant: dict):
    required = [
        "propertyId", "unitId", "fullName", "documentId", "phoneNumber", "checkInDate", "depositAmount", "status"
    ]
    # Check all required fields present
    if not all(k in tenant for k in required):
        raise HTTPException(status_code=400, detail="Missing required tenant fields")

    # Validate checkInDate is ISO date
    from dateutil.parser import parse as parse_date
    try:
        parsed_date = parse_date(tenant["checkInDate"])
        tenant["checkInDate"] = parsed_date.isoformat()
    except Exception:
        raise HTTPException(status_code=400, detail="checkInDate must be a valid ISO date string")

    # Validate depositAmount is a number
    try:
        deposit = float(tenant["depositAmount"])
        tenant["depositAmount"] = str(deposit)
    except Exception:
        raise HTTPException(status_code=400, detail="depositAmount must be a valid number")

    tenants_collection = db["tenants"]
    now = datetime.utcnow()
    tenant_doc = {
        "propertyId": tenant["propertyId"],
        "unitId": tenant["unitId"],
        "fullName": tenant["fullName"],
        "documentId": tenant["documentId"],
        "phoneNumber": tenant["phoneNumber"],
        "checkInDate": tenant["checkInDate"],
        "depositAmount": tenant["depositAmount"],
        "status": tenant["status"],
        "createdAt": now,
        "updatedAt": now,
    }
    result = await tenants_collection.insert_one(tenant_doc)
    tenant_doc["id"] = str(result.inserted_id)
    tenant_doc.pop("_id", None)
    return tenant_doc


@router.get("/tenants", status_code=status.HTTP_200_OK)
async def get_tenants(propertyId: str):
    tenants_collection = db["tenants"]
    tenants_cursor = tenants_collection.find({"propertyId": propertyId})
    tenants = []
    async for tenant in tenants_cursor:
        tenant["id"] = str(tenant["_id"])
        tenant.pop("_id", None)
        tenants.append(tenant)
    return tenants


@router.delete("/tenants/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(tenant_id: str):
    tenants_collection = db["tenants"]
    result = await tenants_collection.delete_one({"_id": ObjectId(tenant_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return

@router.patch("/tenants/{tenant_id}", status_code=status.HTTP_200_OK)
async def update_tenant(tenant_id: str, data: dict):
    tenants_collection = db["tenants"]
    update_fields = {k: v for k, v in data.items() if k in [
        "propertyId", "unitId", "fullName", "documentId", "phoneNumber", "checkInDate", "depositAmount", "status"
    ]}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    update_fields["updatedAt"] = datetime.utcnow()
    result = await tenants_collection.update_one({"_id": ObjectId(tenant_id)}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    updated = await tenants_collection.find_one({"_id": ObjectId(tenant_id)})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return updated
