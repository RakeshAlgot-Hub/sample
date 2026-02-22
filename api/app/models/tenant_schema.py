from typing import List
from pydantic import BaseModel, Field
from typing import Optional

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
    status: str
    profilePictureUrl: Optional[str] = None
    address: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    propertyId: str
    unitId: str
    fullName: str
    documentId: str
    phoneNumber: str
    checkInDate: str
    depositAmount: str
    status: str
    createdAt: str
    updatedAt: str
    profilePictureUrl: Optional[str] = None
    address: Optional[str] = None
