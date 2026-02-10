from fastapi import HTTPException, status
from bson import ObjectId
from models.floorModel import FloorModel
from core.floorDb import (
    createFloor,
    findFloorById,
    findAllFloorsByBuilding,
    updateFloor,
    deleteFloor,
)
from core.buildingDb import findBuildingById
import logging

logger = logging.getLogger(__name__)

# CREATE
async def createFloorService(payload, user):
    building_id = payload.building_id
    building = findBuildingById(building_id)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add floor to this building")

    floorObj = FloorModel(
        building_id=ObjectId(building_id),
        property_id=ObjectId(building["property_id"]),
        ownerId=ObjectId(user["id"]),
        floor_number=payload.floor_number,
        room_count=payload.room_count,
    )
    new_floor = createFloor(floorObj.__dict__)
    return new_floor

# READ ALL BY BUILDING
async def getAllFloorsByBuildingService(buildingId: str, user):
    building = findBuildingById(buildingId)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these floors")
    
    floors = findAllFloorsByBuilding(buildingId)
    return floors

# READ BY ID
async def getFloorByIdService(floorId: str, user):
    floor = findFloorById(floorId)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    if floor["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this floor")
    return floor

# UPDATE
async def updateFloorService(floorId: str, payload, user):
    floor = findFloorById(floorId)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    if floor["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this floor")

    updateData = payload.dict(exclude_unset=True)
    if not updateData:
        return floor
    
    updateFloor(floorId, updateData)
    updated_floor = findFloorById(floorId)
    return updated_floor

# DELETE
async def deleteFloorService(floorId: str, user):
    floor = findFloorById(floorId)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    if floor["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this floor")

    deleteFloor(floorId)
    return
