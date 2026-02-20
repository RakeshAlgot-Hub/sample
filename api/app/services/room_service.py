from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime
import uuid

async def create_room_service(propertyId: str, buildingId: str, roomNumber: str, floor: str, shareType: int):
    properties_collection = db["properties"]
    property = await properties_collection.find_one({"_id": ObjectId(propertyId)})
    if not property:
        return None
    room = {
        "propertyId": str(propertyId),
        "buildingId": str(buildingId),
        "roomNumber": str(roomNumber),
        "floor": str(floor),
        "shareType": int(shareType),
        "occupiedCount": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    rooms_collection = db["rooms"]
    result = await rooms_collection.insert_one(room)
    room["id"] = str(result.inserted_id)
    # Remove _id from response if present
    room.pop("_id", None)
    return {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in room.items()}
