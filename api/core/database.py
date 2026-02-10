
from pymongo import MongoClient
from core.config import settings
import logging
from pymongo.errors import ConnectionFailure

logger = logging.getLogger(__name__)

try:
    client = MongoClient(settings.mongoUrl)
    client.admin.command('ping')
    db = client[settings.mongoDatabase]
    ownerCollection = db[settings.mongoOwnersCollection]
    propertyCollection = db[settings.mongoPropertyCollection]
    buildingCollection = db.get_collection("buildings")
    floorCollection = db.get_collection("floors")
    roomCollection = db.get_collection("rooms")
    bedCollection = db.get_collection("beds")
    memberCollection = db.get_collection("members")

except ConnectionFailure as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    client = None
    db = None
    propertyCollection = None
    buildingCollection = None
    floorCollection = None
    roomCollection = None
    bedCollection = None
    memberCollection = None
