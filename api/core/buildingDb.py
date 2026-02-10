from bson import ObjectId
from core.database import buildingCollection
from core.helpers import serializeMongoDoc

def createBuilding(data: dict):
    buildingCollection.insert_one(data)
    return serializeMongoDoc(data)

def findBuildingById(buildingId: str):
    doc = buildingCollection.find_one({"_id": ObjectId(buildingId)})
    return serializeMongoDoc(doc)

def findAllBuildingsByProperty(propertyId: str):
    docs = buildingCollection.find({"property_id": propertyId})
    return [serializeMongoDoc(doc) for doc in docs]

def updateBuilding(buildingId: str, updateData: dict):
    return buildingCollection.update_one(
        {"_id": ObjectId(buildingId)},
        {"$set": updateData},
    )

def deleteBuilding(buildingId: str):
    return buildingCollection.delete_one({"_id": ObjectId(buildingId)})
