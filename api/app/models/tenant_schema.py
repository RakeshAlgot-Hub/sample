from pydantic import BaseModel
from typing import Optional

class Tenant(BaseModel):
    id: Optional[str] = None
    propertyId: str
    name: str
    email: str
    phone: str
    bed: str
    rent: str
    status: str
    joinDate: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
