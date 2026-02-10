from fastapi import HTTPException, status
from core.bedDb import findBedById, findAllBedsByRoom
from core.roomDb import findRoomById
import logging

logger = logging.getLogger(__name__)

# READ ALL BY ROOM
async def getAllBedsByRoomService(roomId: str, user):
    room = findRoomById(roomId)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these beds")
    
    beds = findAllBedsByRoom(roomId)
    return beds

# READ BY ID
async def getBedByIdService(bedId: str, user):
    bed = findBedById(bedId)
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this bed")
    return bed
