
from fastapi import APIRouter, status, HTTPException, Depends
from app.utils.helpers import get_current_user
from app.services.dashboard_service import get_dashboard_stats_service, get_property_stats_service, get_all_tenants_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_dashboard_stats(propertyId: str, current_user=Depends(get_current_user)):
    return await get_dashboard_stats_service(propertyId)


@router.get("/property-stats", status_code=status.HTTP_200_OK)
async def get_property_stats(propertyId: str, current_user=Depends(get_current_user)):
    result = await get_property_stats_service(propertyId)
    if not result:
        raise HTTPException(status_code=404, detail="Property not found")
    return result


@router.get("/tenants", status_code=status.HTTP_200_OK)
async def get_all_tenants(propertyId: str):
    return await get_all_tenants_service(propertyId)
