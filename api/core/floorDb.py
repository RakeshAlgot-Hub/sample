from bson import ObjectId
from core.database import floorCollection
from core.helpers import serializeMongoDoc

def createFloor(data: dict):
    floorCollection.insert_one(data)
    return serializeMongoDoc(data)

def findFloorById(floorId: str):
    doc = floorCollection.find_one({"_id": ObjectId(floorId)})
    return serializeMongoDoc(doc)

def findAllFloorsByBuilding(buildingId: str):
    docs = floorCollection.find({"building_id": buildingId})
    return [serializeMongoDoc(doc) for doc in docs]

def updateFloor(floorId: str, updateData: dict):
    return floorCollection.update_one(
        {"_id": ObjectId(floorId)},
        {"$set": updateData},
    )

def deleteFloor(floorId: str):
    return floorCollection.delete_one({"_id": ObjectId(floorId)})
