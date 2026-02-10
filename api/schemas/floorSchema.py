from pydantic import BaseModel
from typing import Optional

class FloorCreateSchema(BaseModel):
    building_id: str
    floor_number: int
    room_count: int

class FloorUpdateSchema(BaseModel):
    room_count: Optional[int] = None
    isActive: Optional[bool] = None

class FloorResponseSchema(BaseModel):
    id: str
    building_id: str
    property_id: str
    ownerId: str
    floor_number: int
    room_count: int
    isActive: bool
