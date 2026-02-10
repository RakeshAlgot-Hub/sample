from pydantic import BaseModel
from typing import Optional

class BuildingCreateSchema(BaseModel):
    property_id: str
    name: str
    floor_count: int

class BuildingUpdateSchema(BaseModel):
    name: Optional[str] = None
    floor_count: Optional[int] = None
    isActive: Optional[bool] = None

class BuildingResponseSchema(BaseModel):
    id: str
    property_id: str
    name: str
    floor_count: int
    ownerId: str
    isActive: bool
