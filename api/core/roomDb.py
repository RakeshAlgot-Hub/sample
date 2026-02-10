from bson import ObjectId
from core.database import roomCollection
from core.helpers import serializeMongoDoc

def createRoom(data: dict):
    roomCollection.insert_one(data)
    return serializeMongoDoc(data)

def findRoomById(roomId: str):
    doc = roomCollection.find_one({"_id": ObjectId(roomId)})
    return serializeMongoDoc(doc)

def findAllRoomsByFloor(floorId: str):
    docs = roomCollection.find({"floor_id": floorId})
    return [serializeMongoDoc(doc) for doc in docs]

def updateRoom(roomId: str, updateData: dict):
    return roomCollection.update_one(
        {"_id": ObjectId(roomId)},
        {"$set": updateData},
    )

def deleteRoom(roomId: str):
    return roomCollection.delete_one({"_id": ObjectId(roomId)})
