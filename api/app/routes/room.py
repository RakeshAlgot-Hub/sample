from fastapi import APIRouter, HTTPException
from app.services.room_service import RoomService
from app.models.room_schema import Room

router = APIRouter(prefix="/rooms", tags=["rooms"])
room_service = RoomService()
room_service = RoomService()

@router.get("/")
async def get_rooms(property_id: str = None):
    # Return list of rooms as dicts
    rooms = await room_service.get_rooms(property_id)
    return [room.model_dump() for room in rooms]

@router.get("/{room_id}")
async def get_room(room_id: str):
    # Return a single room as dict
    room = await room_service.get_room(room_id)
    return room.model_dump() if room else {}

@router.post("/")
async def create_room(room: Room):
    # Create a new room
    created = await room_service.create_room(room.model_dump())
    return created.model_dump()

@router.put("/{room_id}")
async def update_room(room_id: str, room: Room):
    # Update room
    updated = await room_service.update_room(room_id, room.model_dump())
    return updated.model_dump() if updated else {}

@router.delete("/{room_id}")
async def delete_room(room_id: str):
    # Delete room
    return await room_service.delete_room(room_id)
