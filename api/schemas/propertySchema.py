from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Optional, Literal


class PropertyCreateSchema(BaseModel):
    name: str
    propertyType: Literal["HOSTEL", "APARTMENT"]
    country: str
    state: str
    city: str
    area: str
    addressLine: str
    pincode: str


class PropertyUpdateSchema(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    addressLine: Optional[str] = None
    pincode: Optional[str] = None
    isActive: Optional[bool] = None


class PropertyResponseSchema(BaseModel):
    id: str
    name: str
    propertyType: str
    city: str
    area: str
    ownerId: str
    isActive: bool
    building_count: int = 0
    room_count: int = 0
    bed_count: int = 0
    occupied_beds: int = 0
    createdAt: datetime
    updatedAt: datetime


# ==================== UI-DRIVEN CREATE SCHEMAS ====================


class UIBed(BaseModel):
    id: str
    occupied: bool


class UIRoom(BaseModel):
    id: str
    roomNumber: str
    shareType: str  # "single", "double", "triple"
    bedCount: int
    beds: list[UIBed]


class UIFloor(BaseModel):
    id: str
    label: str  # "G", "1", "2", etc.
    rooms: list[UIRoom]


class UIBuilding(BaseModel):
    id: str
    name: str
    floors: list[UIFloor]


class UIBedPricing(BaseModel):
    bedCount: int
    dailyPrice: int
    monthlyPrice: int


class UIPropertyCreateSchema(BaseModel):
    name: str
    type: str  # "Hostel/PG" or "Apartments"
    city: str
    area: str
    buildings: list[UIBuilding]
    bedPricing: list[UIBedPricing]
    totalRooms: int
    totalBeds: int
    createdAt: datetime


# ==================== WIZARD SCHEMAS (Internal Backend Use) ====================


class WizardPropertyRequestSchema(BaseModel):
    name: str
    country: str
    state: str
    city: str
    address: str
    phone: str


class WizardBuildingInputSchema(BaseModel):
    name: str
    floor_count: int


class WizardFloorInputSchema(BaseModel):
    building_index: int
    floor_number: int
    floor_label: str  # Added new field
    room_count: int


class WizardRoomInputSchema(BaseModel):
    building_index: int
    floor_number: int
    room_number: int
    share_type: int


class CreateFullPropertyRequestSchema(BaseModel):
    property: WizardPropertyRequestSchema
    buildings: list[WizardBuildingInputSchema]
    floors: list[WizardFloorInputSchema]
    rooms: list[WizardRoomInputSchema]


# Minimal Building schema for response, assuming this might be defined elsewhere eventually
class BuildingResponseSchema(BaseModel):
    id: str
    name: str
    property_id: str
    floor_count: int


class CreateFullPropertyResponseSchema(BaseModel):
    property: PropertyResponseSchema
    buildings: list[BuildingResponseSchema]
    total_floors: int
    total_rooms: int
    total_beds: int


# ==================== PROPERTY DETAILS SCHEMAS ====================
from schemas.bedSchema import BedResponseSchema
from schemas.memberSchema import MemberResponseSchema


class PropertyDetailRoom(BaseModel):
    id: str
    floor_id: str
    building_id: str
    property_id: str
    ownerId: str
    room_number: str
    share_type: int
    isActive: bool
    beds: list[BedResponseSchema] = []


class PropertyDetailFloor(BaseModel):
    id: str
    building_id: str
    property_id: str
    ownerId: str
    floor_number: int
    floor_label: str  # Added new field
    room_count: int
    isActive: bool
    rooms: list[PropertyDetailRoom] = []


class PropertyDetailBuilding(BaseModel):
    id: str
    property_id: str
    name: str
    floor_count: int
    ownerId: str
    isActive: bool
    floors: list[PropertyDetailFloor] = []


class PropertyDetails(BaseModel):
    property: PropertyResponseSchema
    buildings: list[PropertyDetailBuilding] = []
    members: list[MemberResponseSchema] = []
    stats: dict = {
        "building_count": 0,
        "floor_count": 0,
        "room_count": 0,
        "bed_count": 0,
        "occupied_beds": 0,
    }
