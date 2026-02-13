from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import db
from app.models.property import PropertyCreate, PropertyUpdate, PropertySummary

PROPERTY_COLLECTION = db["properties"]

def property_helper(property) -> dict:
    return {
        "id": str(property["_id"]),
        "name": property["name"],
        "type": property["type"],
        "city": property["city"],
        "area": property.get("area", ""),
        "createdAt": property.get("createdAt", datetime.utcnow().isoformat()),
        "totalBuildings": property.get("totalBuildings", 0),
        "totalRooms": property.get("totalRooms", 0),
        "totalFloors": property.get("totalFloors", 0),
        "totalBeds": property.get("totalBeds", 0),
        "occupiedBeds": property.get("occupiedBeds", 0),
        "availableBeds": property.get("availableBeds", 0),
    }

async def create_property(data: PropertyCreate) -> dict:
    property_dict = data.dict()
    property_dict["createdAt"] = datetime.utcnow().isoformat()
    property_dict["totalBuildings"] = 0
    property_dict["totalRooms"] = 0
    property_dict["totalFloors"] = 0
    property_dict["totalBeds"] = 0
    property_dict["occupiedBeds"] = 0
    property_dict["availableBeds"] = 0
    result = await PROPERTY_COLLECTION.insert_one(property_dict)
    new_property = await PROPERTY_COLLECTION.find_one({"_id": result.inserted_id})
    return property_helper(new_property)

async def get_properties() -> List[dict]:
    properties = []
    async for property in PROPERTY_COLLECTION.find():
        properties.append(property_helper(property))
    return properties

async def update_property(id: str, data: PropertyUpdate) -> Optional[dict]:
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        return None
    result = await PROPERTY_COLLECTION.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if result.modified_count == 1:
        updated = await PROPERTY_COLLECTION.find_one({"_id": ObjectId(id)})
        return property_helper(updated)
    return None

async def delete_property(id: str) -> bool:
    result = await PROPERTY_COLLECTION.delete_one({"_id": ObjectId(id)})
    return result.deleted_count == 1
