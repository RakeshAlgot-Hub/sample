from app.db.mongodb import mongodb
from app.models.member import MemberModel
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId

async def get_members():
    cursor = mongodb.db["members"].find()
    return [MemberModel.from_mongo(doc) async for doc in cursor]

async def get_member(member_id: str):
    try:
        obj_id = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid member ID")
    doc = await mongodb.db["members"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Member not found")
    return MemberModel.from_mongo(doc)

async def create_member(data: dict):
    data['joinedDate'] = datetime.utcnow().isoformat()
    member = MemberModel(**data)
    result = await mongodb.db["members"].insert_one(member.to_dict())
    member.id = str(result.inserted_id)
    return member

async def update_member(member_id: str, data: dict):
    try:
        obj_id = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid member ID")
    await mongodb.db["members"].update_one({"_id": obj_id}, {"$set": data})
    return await get_member(member_id)

async def delete_member(member_id: str):
    try:
        obj_id = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid member ID")
    result = await mongodb.db["members"].delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"detail": "Member deleted"}