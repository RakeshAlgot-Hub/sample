from app.models.member import MemberCreate, MemberOut, MemberInDB
from app.database.mongodb import get_collection
from datetime import datetime
from bson import ObjectId
from typing import List

def create_member(member: MemberCreate) -> MemberOut:
    members_collection = get_collection("members")
    # Ensure bed is available (not already assigned)
    bed_query = {
        "propertyId": member.propertyId,
        "buildingId": member.buildingId,
        "floorId": member.floorId,
        "roomId": member.roomId,
        "bedId": member.bedId
    }
    existing = members_collection.find_one(bed_query)
    if existing:
        raise Exception("Bed is already assigned to another member.")
    member_dict = member.dict()
    member_dict["createdAt"] = datetime.utcnow()
    result = members_collection.insert_one(member_dict)
    member_out = MemberInDB(id=str(result.inserted_id), **member_dict)
    return MemberOut(**member_out.dict())

async def get_members(property_id: str, page: int = 1, limit: int = 20) -> List[MemberOut]:
    members_collection = get_collection("members")
    skip = (page - 1) * limit
    cursor = members_collection.find({"propertyId": property_id}).skip(skip).limit(limit)
    members = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        members.append(MemberOut(**doc))
    return members
