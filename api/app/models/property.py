from typing import Optional, List
from pydantic import BaseModel
from bson import ObjectId

class PropertyModel(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    city: str
    area: Optional[str] = None
    buildings: list
    bedPricing: list
    totalRooms: int
    totalBeds: int
    createdAt: str

    def to_dict(self):
        data = self.dict(exclude_none=True)
        if self.id:
            data['_id'] = ObjectId(self.id)
            del data['id']
        return data

    @staticmethod
    def from_mongo(data):
        return PropertyModel(
            id=str(data.get('_id')),
            name=data['name'],
            type=data['type'],
            city=data['city'],
            area=data.get('area'),
            buildings=data.get('buildings', []),
            bedPricing=data.get('bedPricing', []),
            totalRooms=data.get('totalRooms', 0),
            totalBeds=data.get('totalBeds', 0),
            createdAt=data['createdAt']
        )
