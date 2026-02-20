from motor.motor_asyncio import AsyncIOMotorClient
import os

mongoUrl = os.getenv("MONGO_URL")

if not mongoUrl:
    raise RuntimeError("MONGO_URL environment variable is required")

client = AsyncIOMotorClient(mongoUrl)

# Explicitly define database name here
db = client["project"]

def getCollection(name: str):
    return db[name]
