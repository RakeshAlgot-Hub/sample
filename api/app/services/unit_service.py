from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

async def create_units_service(propertyId: str, buildingId: str, floorId: str, roomId: str, num_beds: int):
    units_collection = db["units"]
    units = []
    for bed_number in range(1, num_beds + 1):
        now = datetime.utcnow()
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
