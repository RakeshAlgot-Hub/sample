from fastapi import APIRouter, HTTPException, status, Depends
from app.utils.helpers import get_current_user
from app.services.property_service import (
    get_all_properties,
    create_property_service,
    get_property_by_id,
    update_property_service,
    delete_property_service
)

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("/", response_model=list, status_code=status.HTTP_200_OK)
async def get_properties(current_user=Depends(get_current_user)):
    return await get_all_properties(current_user)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_property(property: dict, current_user=Depends(get_current_user)):
    # If ownerId is not provided, use current_user
    if "ownerId" not in property or not property["ownerId"]:
        property["ownerId"] = current_user
    result = await create_property_service(property)
    return result

@router.get("/{property_id}", status_code=status.HTTP_200_OK)
async def get_property(property_id: str, current_user=Depends(get_current_user)):
    prop = await get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    if prop.get("ownerId") != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Not your property")
    prop["id"] = str(prop["_id"])
    prop.pop("_id", None)
    return prop

@router.put("/{property_id}", status_code=status.HTTP_200_OK)
async def update_property(property_id: str, property: dict, current_user=Depends(get_current_user)):
    prop = await update_property_service(property_id, property)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    if prop.get("ownerId") != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Not your property")
    prop["id"] = str(prop["_id"])
    prop.pop("_id", None)
    return prop

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(property_id: str, current_user=Depends(get_current_user)):
    from app.services.property_service import cascade_delete_property
    deleted = await cascade_delete_property(property_id, current_user)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found or forbidden")
    return None
