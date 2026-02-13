from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.property import PropertyCreate, PropertyUpdate, PropertySummary
from app.services import property_service

router = APIRouter(prefix="/properties", tags=["properties"])

@router.post("/", response_model=PropertySummary, status_code=status.HTTP_201_CREATED)
async def create_property(data: PropertyCreate):
    return await property_service.create_property(data)

@router.get("/", response_model=List[PropertySummary])
async def get_properties():
    return await property_service.get_properties()

@router.patch("/{id}", response_model=PropertySummary)
async def update_property(id: str, data: PropertyUpdate):
    updated = await property_service.update_property(id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Property not found or no changes provided")
    return updated

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(id: str):
    deleted = await property_service.delete_property(id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Property not found")
    return None
