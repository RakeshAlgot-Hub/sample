from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

mongo_url = settings.MONGO_URL
db_name = settings.MONGO_DB_NAME

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

def getCollection(name: str):
    return db[name]
