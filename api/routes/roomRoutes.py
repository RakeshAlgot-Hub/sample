from fastapi import APIRouter, Request, Response, status
from typing import List
from schemas.roomSchema import RoomCreateSchema, RoomUpdateSchema, RoomResponseSchema
from services.roomService import (
    createRoomService,
    getAllRoomsByFloorService,
    getRoomByIdService,
    updateRoomService,
    deleteRoomService,
)

router = APIRouter(tags=["Rooms"])

@router.post("/rooms", response_model=RoomResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_room(payload: RoomCreateSchema, request: Request):
    user = request.state.user
    return await createRoomService(payload, user)

@router.get("/floors/{floorId}/rooms", response_model=List[RoomResponseSchema])
async def get_all_rooms_by_floor(floorId: str, request: Request):
    user = request.state.user
    return await getAllRoomsByFloorService(floorId, user)

@router.get("/rooms/{roomId}", response_model=RoomResponseSchema)
async def get_room_by_id(roomId: str, request: Request):
    user = request.state.user
    return await getRoomByIdService(roomId, user)

@router.patch("/rooms/{roomId}", response_model=RoomResponseSchema)
async def update_room(roomId: str, payload: RoomUpdateSchema, request: Request):
    user = request.state.user
    return await updateRoomService(roomId, payload, user)

@router.delete("/rooms/{roomId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(roomId: str, request: Request):
    user = request.state.user
    await deleteRoomService(roomId, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
