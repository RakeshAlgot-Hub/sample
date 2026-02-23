from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime,timezone

async def create_units_service(propertyId: str, buildingId: str, floorId: str, roomId: str, num_beds: int):
    units_collection = db["units"]
    units = []
    for bed_number in range(1, num_beds + 1):        
        now = datetime.now(timezone.utc)
        unit = {
            "propertyId": propertyId,
            "buildingId": buildingId,
            "floorId": floorId,
            "roomId": roomId,
            "bedNumber": bed_number,
            "status": "available",
            "currentTenantId": None,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await units_collection.insert_one(unit)
        unit["id"] = str(result.inserted_id)
        # Convert all ObjectId and datetime fields to string for JSON serialization
        unit_serializable = {k: (str(v) if isinstance(v, (ObjectId, datetime)) else v) for k, v in unit.items()}
        units.append(unit_serializable)
    return units

async def update_unit_status_and_tenant(unit_id: str, tenant_id: str):
    units_collection = db["units"]
    now = datetime.now(timezone.utc)
    await units_collection.update_one(
        {"_id": ObjectId(unit_id)},
        {"$set": {"status": "occupied", "currentTenantId": tenant_id, "updatedAt": now}}
    )
