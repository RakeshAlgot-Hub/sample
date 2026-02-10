from fastapi import HTTPException, status
from bson import ObjectId
from models.roomModel import RoomModel
from models.bedModel import BedModel
from core.roomDb import (
    createRoom,
    findRoomById,
    findAllRoomsByFloor,
    updateRoom,
    deleteRoom,
)
from core.floorDb import findFloorById
from core.bedDb import createBeds, deleteBedsByRoom
import logging

logger = logging.getLogger(__name__)

# CREATE
async def createRoomService(payload, user):
    floor_id = payload.floor_id
    floor = findFloorById(floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    if floor["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add room to this floor")

    roomObj = RoomModel(
        floor_id=ObjectId(floor_id),
        building_id=ObjectId(floor["building_id"]),
        property_id=ObjectId(floor["property_id"]),
        ownerId=ObjectId(user["id"]),
        room_number=payload.room_number,
        share_type=payload.share_type,
    )
    new_room = createRoom(roomObj.__dict__)
    
    # Create beds for the room
    beds_to_create = []
    for i in range(1, new_room["share_type"] + 1):
        bedObj = BedModel(
            room_id=ObjectId(new_room["id"]),
            property_id=ObjectId(new_room["property_id"]),
            ownerId=ObjectId(user["id"]),
            bed_number=i,
        )
        beds_to_create.append(bedObj.__dict__)
    
    if beds_to_create:
        createBeds(beds_to_create)

    return new_room

# READ ALL BY FLOOR
async def getAllRoomsByFloorService(floorId: str, user):
    floor = findFloorById(floorId)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    if floor["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these rooms")
    
    rooms = findAllRoomsByFloor(floorId)
    return rooms

# READ BY ID
async def getRoomByIdService(roomId: str, user):
    room = findRoomById(roomId)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this room")
    return room

# UPDATE
async def updateRoomService(roomId: str, payload, user):
    room = findRoomById(roomId)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this room")

    updateData = payload.dict(exclude_unset=True)
    if not updateData:
        return room
    
    updateRoom(roomId, updateData)
    updated_room = findRoomById(roomId)
    return updated_room

# DELETE
async def deleteRoomService(roomId: str, user):
    room = findRoomById(roomId)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this room")

    deleteBedsByRoom(roomId)
    deleteRoom(roomId)
    return
