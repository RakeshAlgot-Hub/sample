from typing import List
from pydantic import BaseModel, Field
from typing import Optional

class TenantResponse(BaseModel):
    id: str
    propertyId: str
    unitId: str
    fullName: str
    documentId: str
    phoneNumber: str
    checkInDate: str
    depositAmount: str
    # status field removed
    createdAt: str
    updatedAt: str
    profilePictureUrl: Optional[str] = None
    address: Optional[str] = None

class PaginatedTenantResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[TenantResponse]

class TenantRequest(BaseModel):
    propertyId: str
    unitId: str
    fullName: str
    documentId: str
    phoneNumber: str
    checkInDate: str
    depositAmount: str
    # status field removed
    profilePictureUrl: Optional[str] = None
    address: Optional[str] = None

class TenantUpdate(BaseModel):
    propertyId: Optional[str] = None
    unitId: Optional[str] = None
    fullName: Optional[str] = None
    documentId: Optional[str] = None
    phoneNumber: Optional[str] = None
    checkInDate: Optional[str] = None
    depositAmount: Optional[str] = None
    # status field removed
    profilePictureUrl: Optional[str] = None
    address: Optional[str] = None