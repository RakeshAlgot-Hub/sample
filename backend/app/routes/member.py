from fastapi import APIRouter, HTTPException, status, Depends
from app.models.member import MemberCreate, MemberOut
from app.services.member_service import create_member, get_members

router = APIRouter(prefix="/api")
from typing import List
from app.models.member import MemberOut
from fastapi import Query
@router.get("/members", response_model=List[MemberOut])
async def list_members(propertyId: str, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    return await get_members(propertyId, page, limit)

@router.post("/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member_endpoint(member: MemberCreate):
    try:
        return create_member(member)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
