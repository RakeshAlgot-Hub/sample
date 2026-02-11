from fastapi import APIRouter, Depends, HTTPException
from app.schemas.property import Property, PropertyDetails
from app.services.property_service import get_properties, get_property, create_property, update_property, delete_property
from app.core.auth import get_current_user
from typing import List

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("", response_model=List[Property])
async def list_properties(current_user=Depends(get_current_user)):
    return await get_properties()

@router.get("/{property_id}", response_model=Property)
async def get_property_by_id(property_id: str, current_user=Depends(get_current_user)):
    return await get_property(property_id)

@router.post("", response_model=Property)
async def create_property_api(data: dict, current_user=Depends(get_current_user)):
    return await create_property(data)

@router.put("/{property_id}", response_model=Property)
async def update_property_api(property_id: str, data: dict, current_user=Depends(get_current_user)):
    return await update_property(property_id, data)

@router.delete("/{property_id}")
async def delete_property_api(property_id: str, current_user=Depends(get_current_user)):
    return await delete_property(property_id)
