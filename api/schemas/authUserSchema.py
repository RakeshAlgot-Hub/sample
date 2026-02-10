# api/schemas/authUserSchema.py
from pydantic import BaseModel, Field
from typing import Optional


class UserCreateSchema(BaseModel):
    name: str = Field(example="John Doe")
    email: str = Field(example="owner@example.com")
    password: str = Field(min_length=6, example="secret123")


class UserLoginSchema(BaseModel):
    email: str = Field(example="owner1")
    password: str = Field(example="secret123")


class UserResponseSchema(BaseModel):
    id: str
    email: str
    name: str
