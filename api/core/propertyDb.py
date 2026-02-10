from bson import ObjectId
from core.database import propertyCollection
from core.helpers import serializeMongoDoc


def createProperty(data: dict):
    propertyCollection.insert_one(data)
    return serializeMongoDoc(data)


def findPropertyById(propertyId):
    doc = propertyCollection.find_one({"_id": ObjectId(propertyId)})
    return serializeMongoDoc(doc)


def findAllProperties(query: dict):
    docs = propertyCollection.find(query)
    return [serializeMongoDoc(doc) for doc in docs]


def updateProperty(propertyId, updateData: dict):
    return propertyCollection.update_one(
        {"_id": ObjectId(propertyId)},
        {"$set": updateData},
    )


def deleteProperty(propertyId):
    return propertyCollection.delete_one({"_id": ObjectId(propertyId)})
