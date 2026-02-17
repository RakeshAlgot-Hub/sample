from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MemberBase(BaseModel):
    name: str
    phone: str
    villageName: Optional[str] = None
    joinedDate: Optional[datetime] = None
    payDate: Optional[datetime] = None
    paymentCycle: Optional[int] = None
    nextDueDate: Optional[datetime] = None
    proofId: Optional[str] = None
    profilePic: Optional[str] = None
    propertyId: str
    buildingId: str
    floorId: str
    roomId: str
    bedId: str

class MemberCreate(MemberBase):
    pass

class MemberInDB(MemberBase):
    id: str
    createdAt: datetime

class MemberOut(MemberInDB):
    pass
