from fastapi import APIRouter, Depends, status
from app.models.property_schema import PropertyCreate, PropertyOut
from app.services.property_service import create_property_service, list_properties_service
from typing import List
from app.utils.helpers import get_current_user

router = APIRouter(prefix="/properties", tags=["properties"])

@router.post("", status_code=status.HTTP_201_CREATED, response_model=PropertyOut)
async def create_property(property: PropertyCreate, user_id: str = Depends(get_current_user)):
    return await create_property_service(property)

@router.get("", response_model=List[PropertyOut])

@router.get("", response_model=List[PropertyOut])
async def get_properties(user_id: str = Depends(get_current_user)):
    return await list_properties_service(user_id)
