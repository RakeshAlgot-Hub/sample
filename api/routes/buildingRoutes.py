from fastapi import APIRouter, Request, Response, status
from typing import List
from schemas.buildingSchema import BuildingCreateSchema, BuildingUpdateSchema, BuildingResponseSchema
from services.buildingService import (
    createBuildingService,
    getAllBuildingsByPropertyService,
    getBuildingByIdService,
    updateBuildingService,
    deleteBuildingService,
)

router = APIRouter(tags=["Buildings"])

@router.post("/buildings", response_model=BuildingResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_building(payload: BuildingCreateSchema, request: Request):
    user = request.state.user
    return await createBuildingService(payload, user)

@router.get("/properties/{propertyId}/buildings", response_model=List[BuildingResponseSchema])
async def get_all_buildings_by_property(propertyId: str, request: Request):
    user = request.state.user
    return await getAllBuildingsByPropertyService(propertyId, user)

@router.get("/buildings/{buildingId}", response_model=BuildingResponseSchema)
async def get_building_by_id(buildingId: str, request: Request):
    user = request.state.user
    return await getBuildingByIdService(buildingId, user)

@router.patch("/buildings/{buildingId}", response_model=BuildingResponseSchema)
async def update_building(buildingId: str, payload: BuildingUpdateSchema, request: Request):
    user = request.state.user
    return await updateBuildingService(buildingId, payload, user)

@router.delete("/buildings/{buildingId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_building(buildingId: str, request: Request):
    user = request.state.user
    await deleteBuildingService(buildingId, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
