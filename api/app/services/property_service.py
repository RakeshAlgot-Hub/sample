import uuid
from app.database.mongodb import db
from app.models.property_schema import PropertyCreate, PropertyOut
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

async def create_property_service(property: PropertyCreate) -> PropertyOut:
    now = datetime.now(timezone.utc).isoformat()
    doc = property.model_dump()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    # ownerId should be ObjectId
    doc["ownerId"] = ObjectId(doc["ownerId"])
    result = await db["properties"].insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["ownerId"] = str(doc["ownerId"])
    print("doc after insert:", doc)
    return PropertyOut(**doc)

async def list_properties_service() -> List[PropertyOut]:
    properties = []
    async for doc in db["properties"].find():
        doc["id"] = str(doc["_id"])
        doc["ownerId"] = str(doc["ownerId"])
        properties.append(PropertyOut(**doc))
    return properties