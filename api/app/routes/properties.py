from fastapi import APIRouter, HTTPException, status, Depends
from fastapi import APIRouter, HTTPException, status
from app.services.property_service import (
    get_all_properties,
    create_property_service,
    get_property_by_id,
    update_property_service,
    delete_property_service
)

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("/", response_model=list, status_code=status.HTTP_200_OK)
async def get_properties():
    return await get_all_properties()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_property(property: dict):
    return await create_property_service(property)

@router.get("/{property_id}", status_code=status.HTTP_200_OK)
async def get_property(property_id: str):
    prop = await get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop

@router.put("/{property_id}", status_code=status.HTTP_200_OK)
async def update_property(property_id: str, property: dict):
    prop = await update_property_service(property_id, property)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(property_id: str):
    deleted = await delete_property_service(property_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return None
