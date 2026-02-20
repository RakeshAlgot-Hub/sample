from pydantic import BaseModel
from typing import Optional

class UnitCreateRequest(BaseModel):
    propertyId: str
    buildingId: str
    floorId: str
    roomId: str
    bedNumber: int
    status: str = "available"
    currentTenantId: Optional[str] = None
