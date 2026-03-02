from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel

class Subscription(BaseModel):
    ownerId: str
    plan: Literal['free', 'pro', 'premium']
    status: Literal['active', 'inactive', 'cancelled'] = 'active'
    currentPeriodStart: str
    currentPeriodEnd: str
    propertyLimit: int
    roomLimit: int
    tenantLimit: int
    staffLimit: int
    createdAt: str
    updatedAt: str

class Usage(BaseModel):
    ownerId: str
    properties: int
    tenants: int
    rooms: int
    updatedAt: str
