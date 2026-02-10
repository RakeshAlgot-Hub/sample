from pydantic import BaseModel
from typing import Optional

class RoomCreateSchema(BaseModel):
    floor_id: str
    room_number: str
    share_type: int

class RoomUpdateSchema(BaseModel):
    share_type: Optional[int] = None
    isActive: Optional[bool] = None

class RoomResponseSchema(BaseModel):
    id: str
    floor_id: str
    building_id: str
    property_id: str
    ownerId: str
    room_number: str
    share_type: int
    isActive: bool
