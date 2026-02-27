from pydantic import BaseModel, Field
from typing import Optional

class PropertyBase(BaseModel):
    ownerId: str = Field(..., description="Owner ID")
    name: str = Field(..., description="Property name")
    address: str = Field(..., description="Property address")
    createdAt: Optional[str] = Field(None, description="Created at ISO string")
    updatedAt: Optional[str] = Field(None, description="Updated at ISO string")

class PropertyCreate(PropertyBase):
    pass

class PropertyOut(PropertyBase):
    id: str


