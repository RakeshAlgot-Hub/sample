from pydantic import BaseModel
from typing import Optional, Literal

class BillingConfig(BaseModel):
    status: Literal['paid', 'due', 'overdue']
    billingCycle: Literal['monthly', 'day-wise']
    anchorDate: str
    method: Optional[str] = None

class Tenant(BaseModel):
    id: Optional[str] = None
    propertyId: Optional[str] = None
    roomId: Optional[str] = None
    bedId: Optional[str] = None
    name: Optional[str] = None
    documentId: Optional[str] = None
    phone: Optional[str] = None
    rent: Optional[str] = None
    status: Optional[str] = None
    joinDate: Optional[str] = None
    checkoutDate: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    billingConfig: Optional[BillingConfig] = None
    autoGeneratePayments: Optional[bool] = True

class TenantOut(BaseModel):
    """Response model for list/get tenants with enriched data"""
    id: Optional[str] = None
    propertyId: Optional[str] = None
    roomId: Optional[str] = None
    bedId: Optional[str] = None
    name: Optional[str] = None
    documentId: Optional[str] = None
    phone: Optional[str] = None
    rent: Optional[str] = None
    status: Optional[str] = None
    joinDate: Optional[str] = None
    checkoutDate: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    billingConfig: Optional[BillingConfig] = None
    autoGeneratePayments: Optional[bool] = True
    # Enriched fields
    roomNumber: Optional[str] = None  # Avoid extra API call
    bedNumber: Optional[str] = None   # Avoid extra API call

class TenantCreate(BaseModel):
    propertyId: Optional[str] = None
    roomId: Optional[str] = None
    bedId: Optional[str] = None
    name: Optional[str] = None
    documentId: Optional[str] = None
    phone: Optional[str] = None
    rent: Optional[str] = None
    status: Optional[str] = None
    joinDate: Optional[str] = None
    checkoutDate: Optional[str] = None
    billingConfig: Optional[BillingConfig] = None
    autoGeneratePayments: bool = True  # Default to True for auto-payment creation

class TenantUpdate(BaseModel):
    propertyId: Optional[str] = None
    roomId: Optional[str] = None
    bedId: Optional[str] = None
    name: Optional[str] = None
    documentId: Optional[str] = None
    phone: Optional[str] = None
    rent: Optional[str] = None
    status: Optional[str] = None
    joinDate: Optional[str] = None
    checkoutDate: Optional[str] = None
    billingConfig: Optional[BillingConfig] = None
