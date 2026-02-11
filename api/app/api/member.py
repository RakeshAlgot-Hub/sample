from fastapi import APIRouter, Depends, HTTPException
from app.schemas.member import MemberCreate, MemberOut
from app.services.member_service import get_members, get_member, create_member, update_member, delete_member
from app.core.auth import get_current_user
from typing import List

router = APIRouter(prefix="/members", tags=["members"])

@router.get("", response_model=List[MemberOut])
async def list_members(current_user=Depends(get_current_user)):
    return await get_members()

@router.get("/{member_id}", response_model=MemberOut)
async def get_member_by_id(member_id: str, current_user=Depends(get_current_user)):
    return await get_member(member_id)

@router.post("", response_model=MemberOut)
async def create_member_api(data: dict, current_user=Depends(get_current_user)):
    return await create_member(data)

@router.put("/{member_id}", response_model=MemberOut)
async def update_member_api(member_id: str, data: dict, current_user=Depends(get_current_user)):
    return await update_member(member_id, data)

@router.delete("/{member_id}")
async def delete_member_api(member_id: str, current_user=Depends(get_current_user)):
    return await delete_member(member_id)