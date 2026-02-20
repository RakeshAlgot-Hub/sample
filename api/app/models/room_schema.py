from pydantic import BaseModel

class RoomCreateRequest(BaseModel):
    propertyId: str
    buildingId: str
    roomNumber: str
    floor: str
    shareType: int
