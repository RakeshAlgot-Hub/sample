from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PropertyBase(BaseModel):
    name: str
    type: str
    city: str
    area: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None

class PropertyInDB(PropertyBase):
    id: str
    createdAt: datetime
    totalBuildings: int = 0
    totalRooms: int = 0
    totalFloors: int = 0
    totalBeds: int = 0
    occupiedBeds: int = 0
    availableBeds: int = 0

class PropertySummary(PropertyInDB):
    pass
