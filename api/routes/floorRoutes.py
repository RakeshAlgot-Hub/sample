from fastapi import APIRouter, Request, Response, status
from typing import List
from schemas.floorSchema import FloorCreateSchema, FloorUpdateSchema, FloorResponseSchema
from services.floorService import (
    createFloorService,
    getAllFloorsByBuildingService,
    getFloorByIdService,
    updateFloorService,
    deleteFloorService,
)

router = APIRouter(tags=["Floors"])

@router.post("/floors", response_model=FloorResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_floor(payload: FloorCreateSchema, request: Request):
    user = request.state.user
    return await createFloorService(payload, user)

@router.get("/buildings/{buildingId}/floors", response_model=List[FloorResponseSchema])
async def get_all_floors_by_building(buildingId: str, request: Request):
    user = request.state.user
    return await getAllFloorsByBuildingService(buildingId, user)

@router.get("/floors/{floorId}", response_model=FloorResponseSchema)
async def get_floor_by_id(floorId: str, request: Request):
    user = request.state.user
    return await getFloorByIdService(floorId, user)

@router.patch("/floors/{floorId}", response_model=FloorResponseSchema)
async def update_floor(floorId: str, payload: FloorUpdateSchema, request: Request):
    user = request.state.user
    return await updateFloorService(floorId, payload, user)

@router.delete("/floors/{floorId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_floor(floorId: str, request: Request):
    user = request.state.user
    await deleteFloorService(floorId, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
