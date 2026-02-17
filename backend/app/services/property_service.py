# Update a building for a property
async def update_building(property_id: str, building_id: str, data: dict):
    property_doc = await PROPERTY_COLLECTION.find_one({"_id": ObjectId(property_id)})
    if not property_doc or "buildings" not in property_doc:
        return None
    buildings = property_doc["buildings"]
    updated = None
    for b in buildings:
        if str(b.get("id")) == building_id:
            b.update(data)
            updated = b
            break
    if not updated:
        return None
    await PROPERTY_COLLECTION.update_one({"_id": ObjectId(property_id)}, {"$set": {"buildings": buildings}})
    return updated

# Return the list of buildings for a property
async def get_property_buildings(property_id: str):
    property_doc = await PROPERTY_COLLECTION.find_one({"_id": ObjectId(property_id)})
    if not property_doc:
        return None
    return property_doc.get("buildings", [])
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
        "buildings": property.get("buildings", []),
        "floors": property.get("floors", []),
        "shareTypes": property.get("shareTypes", []),
    }

async def create_property(data: PropertyCreate) -> dict:
    property_dict = data.model_dump()
    property_dict["createdAt"] = datetime.utcnow().isoformat()
    # Convert buildings to list of names if not already
    if property_dict.get("buildings") and isinstance(property_dict["buildings"][0], dict):
        property_dict["buildings"] = [b["name"] for b in property_dict["buildings"]]
    # Add default floors and shareTypes
    property_dict["floors"] = ["G", "1", "2", "3", "4"]
    property_dict["shareTypes"] = [1, 2, 3, 4, 5]
    result = await PROPERTY_COLLECTION.insert_one(property_dict)
    new_property = await PROPERTY_COLLECTION.find_one({"_id": result.inserted_id})
    return property_helper(new_property)

async def get_properties() -> List[dict]:
    properties = []
    async for property in PROPERTY_COLLECTION.find():
        properties.append(property_helper(property))
    return properties

async def update_property(id: str, data: PropertyUpdate) -> Optional[dict]:
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
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
