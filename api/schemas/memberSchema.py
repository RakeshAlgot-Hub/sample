from pydantic import BaseModel
from typing import Optional

class MemberCreateSchema(BaseModel):
    property_id: str
    name: str
    phone: str
    address: Optional[str] = None
    bed_id: Optional[str] = None

class MemberUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    isActive: Optional[bool] = None

class AssignBedSchema(BaseModel):
    bed_id: str

class MemberResponseSchema(BaseModel):
    id: str
    property_id: str
    ownerId: str
    name: str
    phone: str
    address: Optional[str]
    bed_id: Optional[str]
    isActive: bool
