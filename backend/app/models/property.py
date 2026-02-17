from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PropertyBase(BaseModel):
    name: str
    type: str
    city: str
    area: Optional[str] = None


class PropertyCreate(PropertyBase):
    buildings: Optional[list[str]] = []



class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    buildings: Optional[list[str]] = None

class PropertySummary(PropertyBase):
    id: str
    createdAt: datetime
    buildings: list[str] = []
    floors: list[str] = []
    shareTypes: list[int] = []
