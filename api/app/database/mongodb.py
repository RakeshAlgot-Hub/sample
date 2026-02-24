from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

mongo_url = settings.MONGO_URL
db_name = getattr(settings, "MONGO_DB_NAME", "project")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

def getCollection(name: str):
    return db[name]
