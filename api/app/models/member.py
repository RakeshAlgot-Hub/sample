from typing import Optional
from pydantic import BaseModel, EmailStr
from bson import ObjectId

class MemberModel(BaseModel):
    id: Optional[str] = None
    name: str
    phone: Optional[str] = None
    propertyId: Optional[str] = None
    buildingId: Optional[str] = None
    floorId: Optional[str] = None
    roomId: Optional[str] = None
    bedId: Optional[str] = None
    joinedDate: Optional[str] = None
    villageName: Optional[str] = None
    proofId: Optional[str] = None

    def to_dict(self):
        data = self.dict(exclude_none=True)
        if self.id:
            data['_id'] = ObjectId(self.id)
            del data['id']
        return data

    @staticmethod
    def from_mongo(data):
        return MemberModel(
            id=str(data.get('_id')),
            name=data['name'],
            phone=data.get('phone'),
            propertyId=data.get('propertyId'),
            buildingId=data.get('buildingId'),
            floorId=data.get('floorId'),
            roomId=data.get('roomId'),
            bedId=data.get('bedId'),
            joinedDate=data.get('joinedDate'),
            villageName=data.get('villageName'),
            proofId=data.get('proofId')
        )