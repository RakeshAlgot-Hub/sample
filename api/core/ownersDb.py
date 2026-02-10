# api/core/ownersDb.py
from datetime import datetime, timezone
from bson import ObjectId # Added import for ObjectId
from .database import ownerCollection


def getAllOwners(query):
    return ownerCollection.find(query)


def findOwner(query):
    return ownerCollection.find_one(query)


def findOwnerById(ownerId: str): # Added findOwnerById
    return ownerCollection.find_one({"_id": ObjectId(ownerId)})


def updateOwner(query: dict, updateData: dict):
    return ownerCollection.update_one(query, {"$set": updateData})


# ✅ NEW: atomic failed-login update
def incrementFailedLoginOwner(ownerId):
    return ownerCollection.update_one(
        {"_id": ownerId},
        {
            "$inc": {"failedLoginAttempts": 1},
            "$set": {"lastFailedLoginAt": datetime.now(timezone.utc)},
        },
    )


def resetFailedLoginOwner(ownerId):
    return ownerCollection.update_one(
        {"_id": ownerId},
        {
            "$set": {
                "failedLoginAttempts": 0,
                "lastFailedLoginAt": None,
            }
        },
    )


def createOwner(data: dict):
    ownerCollection.insert_one(data)
    data["id"] = data.pop("_id")
    return data
