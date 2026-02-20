from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserInDB(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    password: str  # hashed
    role: str = Field(default="propertyowner")
    isVerified: bool = False
    isDeleted: bool = False
    lastLogin: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    # Device tracking fields for future scalability
    deviceId: Optional[str] = None
    deviceType: Optional[str] = None
    osVersion: Optional[str] = None
    appVersion: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
