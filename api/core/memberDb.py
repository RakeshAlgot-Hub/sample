from bson import ObjectId
from core.database import memberCollection
from core.helpers import serializeMongoDoc

def createMember(data: dict):
    memberCollection.insert_one(data)
    return serializeMongoDoc(data)

def findMemberById(memberId: str):
    doc = memberCollection.find_one({"_id": ObjectId(memberId)})
    return serializeMongoDoc(doc)

def findAllMembersByProperty(propertyId: str):
    docs = memberCollection.find({"property_id": ObjectId(propertyId)})
    return [serializeMongoDoc(doc) for doc in docs]

def updateMember(memberId: str, updateData: dict):
    return memberCollection.update_one(
        {"_id": ObjectId(memberId)},
        {"$set": updateData},
    )

def deleteMember(memberId: str):
    return memberCollection.delete_one({"_id": ObjectId(memberId)})

def findMemberByBedId(bedId: str):
    doc = memberCollection.find_one({"bed_id": ObjectId(bedId)})
    return serializeMongoDoc(doc)
