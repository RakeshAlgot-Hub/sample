import uuid
from app.database.mongodb import db
from app.models.property_schema import PropertyCreate, PropertyOut
from typing import List
from datetime import datetime, timezone

async def create_property_service(property: PropertyCreate) -> PropertyOut:
    now = datetime.now(timezone.utc).isoformat()
    doc = property.model_dump()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    doc["id"] = str(uuid.uuid4())
    await db["properties"].insert_one(doc)

    return PropertyOut(**doc)

async def list_properties_service() -> List[PropertyOut]:
    properties = []
    async for doc in db["properties"].find():
        properties.append(PropertyOut(**doc))
    return properties