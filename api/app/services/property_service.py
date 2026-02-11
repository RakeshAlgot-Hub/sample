from app.db.mongodb import mongodb
from app.models.property import PropertyModel
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId

async def get_properties():
    cursor = mongodb.db["properties"].find()
    return [PropertyModel.from_mongo(doc) async for doc in cursor]

async def get_property(property_id: str):
    try:
        obj_id = ObjectId(property_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid property ID")
    doc = await mongodb.db["properties"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return PropertyModel.from_mongo(doc)

async def create_property(data: dict):
    data['createdAt'] = datetime.utcnow().isoformat()
    prop = PropertyModel(**data)
    result = await mongodb.db["properties"].insert_one(prop.to_dict())
    prop.id = str(result.inserted_id)
    return prop

async def update_property(property_id: str, data: dict):
    try:
        obj_id = ObjectId(property_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid property ID")
    await mongodb.db["properties"].update_one({"_id": obj_id}, {"$set": data})
    return await get_property(property_id)

async def delete_property(property_id: str):
    try:
        obj_id = ObjectId(property_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid property ID")
    result = await mongodb.db["properties"].delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"detail": "Property deleted"}
