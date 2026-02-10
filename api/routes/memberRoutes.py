from fastapi import APIRouter, Request, Response, status
from typing import List
from schemas.memberSchema import MemberCreateSchema, MemberUpdateSchema, MemberResponseSchema, AssignBedSchema
from services.memberService import (
    createMemberService,
    getAllMembersByPropertyService,
    getMemberByIdService,
    updateMemberService,
    deleteMemberService,
    assignToBedService,
    unassignFromBedService,
)

router = APIRouter(tags=["Members"])

@router.post("/members", response_model=MemberResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_member(payload: MemberCreateSchema, request: Request):
    user = request.state.user
    return await createMemberService(payload, user)

@router.get("/properties/{propertyId}/members", response_model=List[MemberResponseSchema])
async def get_all_members_by_property(propertyId: str, request: Request):
    user = request.state.user
    return await getAllMembersByPropertyService(propertyId, user)

@router.get("/members/{memberId}", response_model=MemberResponseSchema)
async def get_member_by_id(memberId: str, request: Request):
    user = request.state.user
    return await getMemberByIdService(memberId, user)

@router.patch("/members/{memberId}", response_model=MemberResponseSchema)
async def update_member(memberId: str, payload: MemberUpdateSchema, request: Request):
    user = request.state.user
    return await updateMemberService(memberId, payload, user)

@router.delete("/members/{memberId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(memberId: str, request: Request):
    user = request.state.user
    await deleteMemberService(memberId, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/members/{memberId}/assign", response_model=MemberResponseSchema)
async def assign_member_to_bed(memberId: str, payload: AssignBedSchema, request: Request):
    user = request.state.user
    return await assignToBedService(memberId, payload.bed_id, user)

@router.post("/members/{memberId}/unassign", response_model=MemberResponseSchema)
async def unassign_member_from_bed(memberId: str, request: Request):
    user = request.state.user
    return await unassignFromBedService(memberId, user)
