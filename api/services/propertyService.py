from fastapi import HTTPException, status

from models.propertyModel import PropertyModel
from models.buildingModel import BuildingModel # For Model ref in service
from models.floorModel import FloorModel # For Model ref in service
from models.roomModel import RoomModel # For Model ref in service
from models.bedModel import BedModel # For Model ref in service

from core.propertyDb import (
    createProperty,
    findPropertyById,
    findAllProperties,
    updateProperty,
    deleteProperty,
)
from core.buildingDb import findAllBuildingsByProperty # New import
from core.floorDb import findAllFloorsByBuilding # New import
from core.roomDb import findAllRoomsByFloor # New import
from core.bedDb import findAllBedsByRoom # New import
from core.memberDb import findMemberByBedId # New import
from datetime import datetime, timezone # Ensure timezone is imported
import logging

logger = logging.getLogger(__name__)


# CREATE
async def createPropertyService(payload, request):
    user = request.state.user
    logger.info("Property creation started by ownerId=%s for property name=%s", user["id"], payload.name)

    propertyObj = PropertyModel(
    name=payload.name,
    propertyType=payload.propertyType,
    country=payload.country,
    state=payload.state,
    city=payload.city,
    area=payload.area,
    addressLine=payload.addressLine,
    pincode=payload.pincode,
    phone=payload.phone,
    ownerId=ObjectId(user["id"]),
)

    try:
        new_property = createProperty(propertyObj.__dict__)
        logger.info("Property created successfully | ownerId=%s | propertyId=%s", user["id"], new_property["id"])
        return new_property
    except Exception as e:
        logger.exception("Error creating property for ownerId=%s | name=%s", user["id"], payload.name)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create property")


# READ ALL
async def getAllPropertiesService(request, propertyType=None):
    user = request.state.user
    logger.info("Request to get all properties by ownerId=%s | propertyType=%s", user["id"], propertyType)
    query = {"ownerId": user["id"]}

    if propertyType:
        query["propertyType"] = propertyType

    try:
        properties = findAllProperties(query)
        
        # Calculate aggregated counts for each property
        for prop in properties:
            prop["building_count"] = 0
            prop["room_count"] = 0
            prop["bed_count"] = 0
            prop["occupied_beds"] = 0

            buildings = findAllBuildingsByProperty(prop["id"])
            prop["building_count"] = len(buildings)

            for building in buildings:
                floors = findAllFloorsByBuilding(building["id"])
                for floor in floors:
                    rooms = findAllRoomsByFloor(floor["id"])
                    prop["room_count"] += len(rooms)
                    for room in rooms:
                        beds = findAllBedsByRoom(room["id"])
                        prop["bed_count"] += len(beds)
                        for bed in beds:
                            # Check if bed is occupied (i.e., has a member assigned)
                            if findMemberByBedId(bed["id"]):
                                prop["occupied_beds"] += 1

        logger.info("Successfully retrieved %d properties for ownerId=%s", len(properties), user["id"])
        return properties
    except Exception as e:
        logger.exception("Error retrieving properties for ownerId=%s", user["id"])
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve properties")



# READ BY ID
async def getPropertyByIdService(propertyId: str, request):
    user = request.state.user
    logger.info("Request to get property by ID | ownerId=%s | propertyId=%s", user["id"], propertyId)
    propertyDoc = findPropertyById(propertyId)
    if not propertyDoc:
        logger.warning("Property not found | ownerId=%s | propertyId=%s", user["id"], propertyId)
        raise HTTPException(status_code=404, detail="Property not found")
    if propertyDoc["ownerId"] != user["id"]:
        logger.warning("Unauthorized access attempt to property | ownerId=%s | propertyId=%s", user["id"], propertyId)
        raise HTTPException(status_code=403, detail="Not allowed")
    logger.info("Successfully retrieved property | ownerId=%s | propertyId=%s", user["id"], propertyId)
    return propertyDoc


# UPDATE
# UPDATE
async def updatePropertyService(propertyId: str, payload, request):
    user = request.state.user
    logger.info(
        "Property update started | ownerId=%s | propertyId=%s",
        user["id"],
        propertyId,
    )

    propertyDoc = findPropertyById(propertyId)


    if not propertyDoc:
        raise HTTPException(status_code=404, detail="Property not found")

    if propertyDoc["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    # ✅ IMPORTANT FIX HERE
    updateData = payload.dict(exclude_unset=True)

    if not updateData:
        return propertyDoc

    try:
        updateProperty(propertyId, updateData)
        logger.info(
            "Property updated | ownerId=%s | propertyId=%s",
            user["id"],
            propertyId,
        )
        updated_doc = findPropertyById(propertyId)
        return updated_doc

    except Exception:
        logger.exception(
            "Property update failed | ownerId=%s | propertyId=%s",
            user["id"],
            propertyId,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update property",
        )


# DELETE
async def deletePropertyService(propertyId: str, request):
    user = request.state.user
    logger.info("Property deletion started by ownerId=%s for propertyId=%s", user["id"], propertyId)
    propertyDoc = findPropertyById(propertyId)

    if not propertyDoc:
        logger.warning("Property not found for deletion | ownerId=%s | propertyId=%s", user["id"], propertyId)
        raise HTTPException(status_code=404, detail="Property not found")

    if propertyDoc["ownerId"] != user["id"]:
        logger.warning("Unauthorized deletion attempt to property | ownerId=%s | propertyId=%s", user["id"], propertyId)
        raise HTTPException(status_code=403, detail="Not allowed")

    try:
        deleteProperty(propertyId)
        logger.info("Property deleted successfully | ownerId=%s | propertyId=%s", user["id"], propertyId)
        return {"message": "Property deleted successfully"}
    except Exception as e:
        logger.exception("Error deleting property for ownerId=%s | propertyId=%s", user["id"], propertyId)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete property")


# WIZARD - CREATE FULL PROPERTY
from schemas.propertySchema import CreateFullPropertyRequestSchema
from models.bedModel import BedModel # For creating beds
from models.roomModel import RoomModel # For creating rooms (needed for room.property_id, building_id etc)
from models.floorModel import FloorModel # For creating floors
from models.buildingModel import BuildingModel # For creating buildings

from core.buildingDb import createBuilding
from core.floorDb import createFloor
from core.roomDb import createRoom
from core.bedDb import createBeds
from bson import ObjectId

from datetime import datetime, timezone
import uuid

async def createFullPropertyService(payload: CreateFullPropertyRequestSchema, request):
    user = request.state.user
    property_data = payload.property
    logger.info("Full property creation started by ownerId=%s for property name=%s", user["id"], property_data.name)

    # 1. Create Property
    propertyObj = PropertyModel(
        name=property_data.name,
        propertyType="HOSTEL",  # Defaulting as it's not in wizard
        country=property_data.country,
        state=property_data.state,
        city=property_data.city,
        area=property_data.city, # Defaulting area to city
        addressLine=property_data.address,
        pincode="", # Defaulting pincode as it's not in wizard
        phone=property_data.phone,
        ownerId=user["id"],
    )

    try:
        print("Creating Property with data:", propertyObj.__dict__)
        new_property = createProperty(propertyObj.__dict__)
        print("Created Property:", new_property)
        property_id = new_property["id"]
        logger.info("Wizard: Property created | ownerId=%s | propertyId=%s", user["id"], property_id)
    except Exception as e:
        logger.exception("Wizard: Error creating property for ownerId=%s | name=%s", user["id"], property_data.name)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create property shell")

    # 2. Create Buildings, Floors, Rooms, and Beds
    created_buildings = []
    created_floors = []
    created_rooms = []
    beds_to_create = []
    
    total_floors_count = 0
    total_rooms_count = 0
    total_beds_count = 0

    # Map building_index to actual created building document
    building_map = {} 
    for i, building_payload in enumerate(payload.buildings):
        buildingObj = BuildingModel(
            property_id=property_id,
            name=building_payload.name,
            floor_count=building_payload.floor_count,
            ownerId=user["id"],
        )
        try:
            new_building = createBuilding(buildingObj.__dict__)
            created_buildings.append(new_building)
            building_map[i] = new_building # Map original index to created doc
            logger.info("Wizard: Building created | buildingId=%s", new_building["id"])
        except Exception as e:
            logger.exception("Wizard: Error creating building for propertyId=%s | name=%s", property_id, building_payload.name)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create buildings")
    
    # Map floor (building_index, floor_number) to actual created floor document
    floor_map = {}
    for floor_payload in payload.floors:
        building_doc = building_map.get(floor_payload.building_index)
        if not building_doc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Building at index {floor_payload.building_index} not found for floor {floor_payload.floor_number}")

        floorObj = FloorModel(
            building_id=building_doc["id"],
            property_id=property_id,
            ownerId=user["id"],
            floor_number=floor_payload.floor_number,
            room_count=floor_payload.room_count,
        )
        try:
            new_floor = createFloor(floorObj.__dict__)
            created_floors.append(new_floor)
            # Use a tuple as key for unique floor identification
            floor_map[(floor_payload.building_index, floor_payload.floor_number)] = new_floor 
            logger.info("Wizard: Floor created | floorId=%s", new_floor["id"])
            total_floors_count += 1
        except Exception as e:
            logger.exception("Wizard: Error creating floor for buildingId=%s | floor_number=%s", building_doc["id"], floor_payload.floor_number)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create floors")

    # Create Rooms and Beds
    for room_payload in payload.rooms:
        floor_doc = floor_map.get((room_payload.building_index, room_payload.floor_number))
        if not floor_doc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Floor {room_payload.floor_number} in building {room_payload.building_index} not found for room {room_payload.room_number}")

        building_doc = building_map.get(room_payload.building_index) # Should exist if floor exists

        roomObj = RoomModel(
            floor_id=floor_doc["id"],
            building_id=building_doc["id"],
            property_id=property_id,
            ownerId=user["id"],
            room_number=str(room_payload.room_number), # Ensure room_number is string
            share_type=room_payload.share_type,
        )
        try:
            new_room = createRoom(roomObj.__dict__)
            created_rooms.append(new_room)
            logger.info("Wizard: Room created | roomId=%s", new_room["id"])
            total_rooms_count += 1

            # Create beds for the room
            for i in range(1, new_room["share_type"] + 1):
                bedObj = BedModel(
                    room_id=new_room["id"],
                    property_id=property_id,
                    ownerId=user["id"],
                    bed_number=i,
                )
                beds_to_create.append(bedObj.__dict__)
                total_beds_count += 1
        except Exception as e:
            logger.exception("Wizard: Error creating room for floorId=%s | room_number=%s", floor_doc["id"], room_payload.room_number)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create rooms and beds")
    
    if beds_to_create:
        try:
            createBeds(beds_to_create)
            logger.info("Wizard: Created %d beds for propertyId=%s", len(beds_to_create), property_id)
        except Exception as e:
            logger.exception("Wizard: Error bulk creating beds for propertyId=%s", property_id)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create property beds")

    # 3. Construct Response
    logger.info("Full property creation successful for ownerId=%s | propertyId=%s", user["id"], property_id)

    return {
        "property": new_property,
        "buildings": created_buildings, # Now contains real created documents
        "total_floors": total_floors_count,
        "total_rooms": total_rooms_count,
        "total_beds": total_beds_count,
    }


# PROPERTY DETAILS
from schemas.propertySchema import PropertyDetails, PropertyDetailBuilding, PropertyDetailFloor, PropertyDetailRoom
from schemas.bedSchema import BedResponseSchema
from schemas.memberSchema import MemberResponseSchema
from core.buildingDb import findAllBuildingsByProperty
from core.floorDb import findAllFloorsByBuilding
from core.roomDb import findAllRoomsByFloor
from core.bedDb import findAllBedsByRoom
from core.memberDb import findAllMembersByProperty

async def getPropertyDetailsService(propertyId: str, request):
    user = request.state.user
    logger.info("Request to get property details | ownerId=%s | propertyId=%s", user["id"], propertyId)

    # 1. Fetch Property
    propertyDoc = findPropertyById(propertyId)
    if not propertyDoc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    if propertyDoc["ownerId"] != user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this property")

    # Initialize PropertyDetails structure
    property_details = PropertyDetails(
        property=propertyDoc,
        buildings=[],
        members=[],
        stats={
            "building_count": 0,
            "floor_count": 0,
            "room_count": 0,
            "bed_count": 0,
            "occupied_beds": 0,
        }
    )

    # 2. Fetch Buildings
    buildings_docs = findAllBuildingsByProperty(propertyId)
    property_details.stats["building_count"] = len(buildings_docs)

    for building_doc in buildings_docs:
        building_detail = PropertyDetailBuilding(
            **building_doc,
            floors=[]
        )
        property_details.buildings.append(building_detail)
        
        # 3. Fetch Floors for each Building
        floors_docs = findAllFloorsByBuilding(building_doc["id"])
        property_details.stats["floor_count"] += len(floors_docs)

        for floor_doc in floors_docs:
            floor_detail = PropertyDetailFloor(
                **floor_doc,
                rooms=[]
            )
            building_detail.floors.append(floor_detail)

            # 4. Fetch Rooms for each Floor
            rooms_docs = findAllRoomsByFloor(floor_doc["id"])
            property_details.stats["room_count"] += len(rooms_docs)

            for room_doc in rooms_docs:
                room_detail = PropertyDetailRoom(
                    **room_doc,
                    beds=[]
                )
                floor_detail.rooms.append(room_detail)

                # 5. Fetch Beds for each Room
                beds_docs = findAllBedsByRoom(room_doc["id"])
                property_details.stats["bed_count"] += len(beds_docs)

                for bed_doc in beds_docs:
                    if bed_doc.get("is_occupied"):
                        property_details.stats["occupied_beds"] += 1
                    room_detail.beds.append(BedResponseSchema(**bed_doc))
    
    # 6. Fetch Members
    members_docs = findAllMembersByProperty(propertyId)
    for member_doc in members_docs:
        property_details.members.append(MemberResponseSchema(**member_doc))

    logger.info("Successfully retrieved property details for ownerId=%s | propertyId=%s", user["id"], propertyId)
    return property_details

