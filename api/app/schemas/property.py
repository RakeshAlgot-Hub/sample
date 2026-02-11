from pydantic import BaseModel, Field
from typing import List, Optional, Literal

PropertyType = Literal['Hostel/PG', 'Apartments']
ShareType = Literal['single', 'double', 'triple']
BillingPeriod = Literal['monthly', 'weekly', 'hourly', 'yearly']

class BedPricing(BaseModel):
    bedCount: int
    dailyPrice: float
    monthlyPrice: float

class Bed(BaseModel):
    id: str
    occupied: bool

class Room(BaseModel):
    id: str
    roomNumber: str
    shareType: ShareType
    bedCount: Optional[int] = None
    beds: List[Bed]

class Floor(BaseModel):
    id: str
    label: str
    rooms: List[Room]

class Building(BaseModel):
    id: str
    name: str
    floors: List[Floor]

class PropertyDetails(BaseModel):
    name: str
    type: Optional[PropertyType]
    city: str
    area: Optional[str] = None

class Property(BaseModel):
    id: str
    name: str
    type: PropertyType
    city: str
    area: Optional[str] = None
    buildings: List[Building]
    bedPricing: List[BedPricing]
    totalRooms: int
    totalBeds: int
    createdAt: str
