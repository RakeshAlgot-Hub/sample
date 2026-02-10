from bson import ObjectId
from core.database import bedCollection
from core.helpers import serializeMongoDoc

def createBeds(beds_data: list):
    return bedCollection.insert_many(beds_data)

def findBedById(bedId: str):
    doc = bedCollection.find_one({"_id": ObjectId(bedId)})
    return serializeMongoDoc(doc)

def findAllBedsByRoom(roomId: str):
    docs = bedCollection.find({"room_id": roomId})
    return [serializeMongoDoc(doc) for doc in docs]

def deleteBedsByRoom(roomId: str):
    return bedCollection.delete_many({"room_id": roomId})
