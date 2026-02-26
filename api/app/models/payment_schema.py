from pydantic import BaseModel
from typing import Optional

class Payment(BaseModel):
    id: Optional[str] = None
    tenantId: str
    propertyId: str
    tenantName: str
    property: str
    bed: str
    amount: str
    status: str
    date: Optional[str] = None
    dueDate: str
    method: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
