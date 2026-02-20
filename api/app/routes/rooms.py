from fastapi import APIRouter, HTTPException, status
from app.services.room_service import create_room_service
from app.models.room_schema import RoomCreateRequest
from app.database.mongodb import db

router = APIRouter()




@router.post("/rooms", status_code=status.HTTP_201_CREATED)
async def create_room_endpoint(request: RoomCreateRequest):
    room = await create_room_service(
        request.propertyId,
        request.buildingId,
        request.roomNumber,
        request.floor,
        request.shareType
    )
    if not room:
        raise HTTPException(status_code=404, detail="Property not found")
    return room


@router.get("/rooms")
async def get_rooms(propertyId: str):
    rooms_collection = db["rooms"]
    rooms_cursor = rooms_collection.find({"propertyId": propertyId})
    rooms = []
    async for room in rooms_cursor:
        room["id"] = str(room["_id"])
        room.pop("_id", None)
        rooms.append(room)
    return rooms

