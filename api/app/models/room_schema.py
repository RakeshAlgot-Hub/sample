from pydantic import BaseModel
from typing import Optional

class Room(BaseModel):
    id: Optional[str] = None
    propertyId: str
    roomNumber: str
    floor: str
    price: int
    numberOfBeds: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
