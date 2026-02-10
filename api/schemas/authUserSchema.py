# api/schemas/authUserSchema.py
from pydantic import BaseModel, Field, EmailStr, model_validator
from typing import Optional
from datetime import datetime

class DeviceMetaData(BaseModel):
    deviceId: str = Field(..., example="some-unique-device-id")
    platform: str = Field(..., example="ios" , pattern="^(ios|android|web)$")
    appVersion: str = Field(..., example="1.0.0")

class UserCreateSchema(BaseModel):
    fullName: str = Field(..., min_length=3, max_length=100, example="John Doe")
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com")
    phoneNumber: Optional[str] = Field(None, example="+15551234567")
    password: str = Field(..., min_length=6, example="SecureP@ssw0rd")
    device: DeviceMetaData = Field(...)

    @model_validator(mode='after')
    def check_email_or_phone_provided(self):
        if not self.email and not self.phoneNumber:
            raise ValueError("Either email or phoneNumber must be provided.")
        return self

class UserLoginSchema(BaseModel):
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com")
    phoneNumber: Optional[str] = Field(None, example="+15551234567")
    password: str = Field(..., example="SecureP@ssw0rd")
    device: DeviceMetaData = Field(...)

    @model_validator(mode='after')
    def check_email_or_phone_provided(self):
        if not self.email and not self.phoneNumber:
            raise ValueError("Either email or phoneNumber must be provided.")
        return self

class UserResponseSchema(BaseModel):
    id: str
    fullName: str
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    role: str = "owner"
    isActive: bool = True
    isEmailVerified: bool = False
    createdAt: datetime
    accessToken: str
    refreshToken: Optional[str] = None

class TokenRefreshSchema(BaseModel):
    refreshToken: str = Field(..., example="your-refresh-token")
    deviceId: str = Field(..., example="some-unique-device-id")

