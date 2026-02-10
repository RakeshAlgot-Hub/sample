from fastapi import APIRouter, Request
from typing import List
from schemas.bedSchema import BedResponseSchema
from services.bedService import (
    getAllBedsByRoomService,
    getBedByIdService,
)

router = APIRouter(tags=["Beds"])

@router.get("/rooms/{roomId}/beds", response_model=List[BedResponseSchema])
async def get_all_beds_by_room(roomId: str, request: Request):
    user = request.state.user
    return await getAllBedsByRoomService(roomId, user)

@router.get("/beds/{bedId}", response_model=BedResponseSchema)
async def get_bed_by_id(bedId: str, request: Request):
    user = request.state.user
    return await getBedByIdService(bedId, user)
