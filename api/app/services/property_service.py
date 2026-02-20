from app.database.mongodb import db
from datetime import datetime
from bson import ObjectId
import uuid
properties_collection = db["properties"]

async def get_all_properties():
    properties = []
    async for prop in properties_collection.find():
        prop["id"] = str(prop["_id"])
        prop.pop("_id", None)
        properties.append(prop)
    return properties

async def create_property_service(property: dict):
    property["createdAt"] = datetime.utcnow()
    property["updatedAt"] = datetime.utcnow()
    # Ensure buildings are objects with id and name
    property["buildings"] = [
        {"id": str(uuid.uuid4()), "name": b["name"] if isinstance(b, dict) and "name" in b else str(b)}
        for b in property.get("buildings", [])
    ]
    # Ensure floors are objects with label and name
    default_floors = [
        {"label": "G", "name": "Ground"},
        {"label": "1", "name": "First"},
        {"label": "2", "name": "Second"},
        {"label": "3", "name": "Third"},
        {"label": "4", "name": "Fourth"},
    ]
    property["floors"] = default_floors
    property["shareTypes"] = [1, 2, 3, 4, 5]
    result = await properties_collection.insert_one(property)
    property["id"] = str(result.inserted_id)
    property.pop("_id", None)
    return property

async def get_property_by_id(property_id: str):
    prop = await properties_collection.find_one({"_id": ObjectId(property_id)})
    if not prop:
        return None
    prop["id"] = str(prop["_id"])
    prop.pop("_id", None)
    return prop

async def update_property_service(property_id: str, property: dict):
    property["updatedAt"] = datetime.utcnow()
    result = await properties_collection.update_one({"_id": ObjectId(property_id)}, {"$set": property})
    if result.matched_count == 0:
        return None
    prop = await properties_collection.find_one({"_id": ObjectId(property_id)})
    prop["id"] = str(prop["_id"])
    prop.pop("_id", None)
    return prop

async def delete_property_service(property_id: str):
    result = await properties_collection.delete_one({"_id": ObjectId(property_id)})
    return result.deleted_count > 0
