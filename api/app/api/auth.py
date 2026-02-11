from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.schemas.token import Token, TokenRefreshRequest
from app.services.auth_service import create_user, authenticate_user
from app.core.security import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(user_in: UserCreate):
    if not user_in.email or not user_in.password or not user_in.name:
        raise HTTPException(status_code=422, detail="All fields are required.")
    if len(user_in.password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters.")
    if len(user_in.password.encode('utf-8')) > 72:
        raise HTTPException(status_code=422, detail="Password cannot be longer than 72 bytes.")
    print(f"Creating user with email: {user_in}")  # Debugging statement
    user = await create_user(user_in)
    print(f"Created user: {user}")  # Debugging statement
    # Ensure user.id is set before creating tokens
    if not user.id and hasattr(user, '_id'):
        user.id = str(user._id)
    if not user.id:
        from bson import ObjectId
        # Try to fetch from DB if still missing
        from app.services.auth_service import get_user_by_email
        db_user = await get_user_by_email(user.email)
        if db_user and db_user.id:
            user.id = db_user.id
        else:
            user.id = str(ObjectId())
    access_token = create_access_token({"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }


@router.post("/login")
async def login(user_in: UserLogin):
    if not user_in.email or not user_in.password:
        raise HTTPException(status_code=422, detail="Email and password are required.")
    if len(user_in.password.encode('utf-8')) > 72:
        raise HTTPException(status_code=422, detail="Password cannot be longer than 72 bytes.")
    user = await authenticate_user(user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    access_token = create_access_token({"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

# Endpoint to refresh access token
@router.post("/refresh", response_model=Token)
async def refresh_token(request: TokenRefreshRequest):
    from jose import jwt, JWTError
    from app.core.security import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token type")
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token({"sub": user_id, "email": email})
    refresh_token = create_refresh_token({"sub": user_id, "email": email})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
