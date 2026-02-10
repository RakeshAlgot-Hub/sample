from fastapi import HTTPException, status
from bson import ObjectId
from models.memberModel import MemberModel
from core.memberDb import (
    createMember,
    findMemberById,
    findAllMembersByProperty,
    updateMember,
    deleteMember,
    findMemberByBedId,
)
from core.propertyDb import findPropertyById, findAllProperties # Added findAllProperties
from core.bedDb import findBedById
import logging

logger = logging.getLogger(__name__)

# CREATE
async def createMemberService(payload, user):
    property_id = payload.property_id
    property = findPropertyById(property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    if property["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add member to this property")
    
    if payload.bed_id:
        bed = findBedById(payload.bed_id)
        if not bed:
            raise HTTPException(status_code=404, detail="Bed not found")
        if bed["ownerId"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to assign member to this bed")
        
        # Check if bed is already occupied
        existing_member_on_bed = findMemberByBedId(payload.bed_id)
        if existing_member_on_bed:
            raise HTTPException(status_code=409, detail=f"Bed {bed['bed_number']} in room {bed['room_id']} is already occupied by {existing_member_on_bed['name']}")

    memberObj = MemberModel(
        property_id=ObjectId(property_id),
        ownerId=ObjectId(user["id"]),
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
        bed_id=ObjectId(payload.bed_id) if payload.bed_id else None,
    )
    new_member = createMember(memberObj.__dict__)
    return new_member

# READ ALL BY PROPERTY (OR ALL FOR USER IF propertyId IS NONE)
async def getAllMembersByPropertyService(propertyId: str | None, user):
    if propertyId is None:
        # Get all properties for the user
        user_properties = findAllProperties({"ownerId": user["id"]})
        all_members = []
        for prop in user_properties:
            members_in_property = findAllMembersByProperty(prop["id"])
            all_members.extend(members_in_property)
        return all_members
    else:
        property = findPropertyById(propertyId)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        if property["ownerId"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to view these members")
        
        members = findAllMembersByProperty(propertyId)
        return members

# READ BY ID
async def getMemberByIdService(memberId: str, user):
    member = findMemberById(memberId)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this member")
    return member

# UPDATE
async def updateMemberService(memberId: str, payload, user):
    member = findMemberById(memberId)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this member")

    updateData = payload.dict(exclude_unset=True)
    if not updateData:
        return member
    
    updateMember(memberId, updateData)
    updated_member = findMemberById(memberId)
    return updated_member

# DELETE
async def deleteMemberService(memberId: str, user):
    member = findMemberById(memberId)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this member")

    deleteMember(memberId)
    return

# ASSIGN TO BED
async def assignToBedService(memberId: str, bedId: str, user):
    member = findMemberById(memberId)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to assign this member to a bed")
    
    bed = findBedById(bedId)
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to assign member to this bed")
    
    # Check if bed is already occupied
    existing_member_on_bed = findMemberByBedId(bedId)
    if existing_member_on_bed and existing_member_on_bed["id"] != memberId:
        raise HTTPException(status_code=409, detail=f"Bed {bed['bed_number']} in room {bed['room_id']} is already occupied by {existing_member_on_bed['name']}")
    
    # Unassign from previous bed if any
    if member["bed_id"]:
        updateMember(memberId, {"bed_id": None})
    
    updateMember(memberId, {"bed_id": ObjectId(bedId)})
    updated_member = findMemberById(memberId)
    return updated_member

# UNASSIGN FROM BED
async def unassignFromBedService(memberId: str, user):
    member = findMemberById(memberId)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to unassign this member from a bed")
    
    if not member["bed_id"]:
        raise HTTPException(status_code=400, detail="Member is not assigned to any bed")
    
    updateMember(memberId, {"bed_id": None})
    updated_member = findMemberById(memberId)
    return updated_member
