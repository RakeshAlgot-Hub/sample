from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.schemas.user import UserOut

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    return current_user
