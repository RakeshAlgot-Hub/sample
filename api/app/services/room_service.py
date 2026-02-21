from motor.motor_asyncio import AsyncIOMotorClient

async def cascade_delete_room(room_id: str, property_id: str, owner_id: str):
    rooms_collection = db["rooms"]
    properties_collection = db["properties"]
    # Validate ownership
    prop = await properties_collection.find_one({"_id": ObjectId(property_id)})
    if not prop or prop.get("ownerId") != owner_id:
        return False
    room = await rooms_collection.find_one({"_id": ObjectId(room_id)})
    if not room or room.get("propertyId") != str(property_id):
        return False
    client: AsyncIOMotorClient = db.client
    async with await client.start_session() as s:
        async with s.start_transaction():
            await db["units"].delete_many({"roomId": room_id}, session=s)
            await db["tenants"].delete_many({"roomId": room_id}, session=s)
            await db["payments"].delete_many({"roomId": room_id}, session=s)
            result = await rooms_collection.delete_one({"_id": ObjectId(room_id)}, session=s)
            return result.deleted_count > 0
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime,timezone
import uuid

async def create_room_service(propertyId: str, buildingId: str, roomNumber: str, floor: str, shareType: int):
    properties_collection = db["properties"]
    property = await properties_collection.find_one({"_id": ObjectId(propertyId)})
    if not property:
        return None

    rooms_collection = db["rooms"]
    room_count = await rooms_collection.count_documents({"propertyId": str(propertyId)})
    room_limit = property.get("roomLimit", 90)
    if room_count >= room_limit:
        raise Exception(f"Maximum {room_limit} rooms allowed per property.")

    room = {
        "propertyId": str(propertyId),
        "buildingId": str(buildingId),
        "roomNumber": str(roomNumber),
        "floor": str(floor),
        "shareType": int(shareType),
        "occupiedCount": 0,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = await rooms_collection.insert_one(room)
    room["id"] = str(result.inserted_id)
    # Remove _id from response if present
    room.pop("_id", None)
    return {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in room.items()}
