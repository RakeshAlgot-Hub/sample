from fastapi import HTTPException, status
from bson import ObjectId
from models.buildingModel import BuildingModel
from core.buildingDb import (
    createBuilding,
    findBuildingById,
    findAllBuildingsByProperty,
    updateBuilding,
    deleteBuilding,
)
from core.propertyDb import findPropertyById
import logging

logger = logging.getLogger(__name__)

# CREATE
async def createBuildingService(payload, user):
    property_id = payload.property_id
    property = findPropertyById(property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    if property["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add building to this property")

    buildingObj = BuildingModel(
        property_id=ObjectId(property_id),
        name=payload.name,
        floor_count=payload.floor_count,
        ownerId=ObjectId(user["id"]),
    )
    new_building = createBuilding(buildingObj.__dict__)
    return new_building

# READ ALL BY PROPERTY
async def getAllBuildingsByPropertyService(propertyId: str, user):
    property = findPropertyById(propertyId)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    if property["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these buildings")
    
    buildings = findAllBuildingsByProperty(propertyId)
    return buildings

# READ BY ID
async def getBuildingByIdService(buildingId: str, user):
    building = findBuildingById(buildingId)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this building")
    return building

# UPDATE
async def updateBuildingService(buildingId: str, payload, user):
    building = findBuildingById(buildingId)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this building")

    updateData = payload.dict(exclude_unset=True)
    if not updateData:
        return building
    
    updateBuilding(buildingId, updateData)
    updated_building = findBuildingById(buildingId)
    return updated_building

# DELETE
async def deleteBuildingService(buildingId: str, user):
    building = findBuildingById(buildingId)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    if building["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this building")

    deleteBuilding(buildingId)
    return
