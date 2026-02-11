from pydantic import BaseModel
from typing import Optional

class MemberCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    propertyId: Optional[str] = None
    buildingId: Optional[str] = None
    floorId: Optional[str] = None
    roomId: Optional[str] = None
    bedId: Optional[str] = None
    villageName: Optional[str] = None
    joinedDate: Optional[str] = None
    proofId: Optional[str] = None

class MemberOut(MemberCreate):
    id: str
    joinedDate: Optional[str] = None