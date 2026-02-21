
from app.models.user_schema import UserCreate, UserLogin, UserOut, AuthResponse
from app.database.mongodb import db
from datetime import datetime,timezone
from bson import ObjectId
from fastapi.responses import JSONResponse
from fastapi import Body,APIRouter, HTTPException, status, Header, Request
from app.utils.rate_limit import rate_limit_dep
from datetime import timedelta
from app.database.token_blacklist import blacklist_token, is_token_blacklisted
from fastapi.encoders import jsonable_encoder
from jose import JWTError,jwt
from app.utils.helpers import hash_password, verify_password, create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])

users_collection = db["users"]


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, summary="Register a new user", tags=["auth"])
async def register(user: UserCreate):
    """
    Register a new user. Email must be unique. Password is securely hashed. Role is always set to 'propertyowner'.
    Returns user info and JWT token on success.
    """
    # Registration is open (no secret required)

    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    hashed_pw = hash_password(user.password)

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": "propertyowner",
        "isVerified": True,
        "isDeleted": False,
        "lastLogin": None,
        "createdAt": now,
        "updatedAt": now,
        # Device tracking fields (future)
        "deviceId": None,
        "deviceType": None,
        "osVersion": None,
        "appVersion": None,
    }
    try:
        result = await users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        # Generate tokens
        access_token = create_access_token({"sub": user_id})
        refresh_token = create_refresh_token({"sub": user_id})
        user_out = UserOut(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"]
        )
        response = AuthResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=user_out
        )
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=response.dict())
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User registration failed")


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK, summary="Authenticate user and return JWT", tags=["auth"])
@rate_limit_dep
async def login(request: Request, data: UserLogin):
    """
    Authenticate user with email and password. Returns user info and JWT token on success.
    Blocks login if account is deleted.
    """
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.get("isDeleted"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deleted")

    try:
        await users_collection.update_one({"_id": user["_id"]}, {"$set": {"lastLogin": datetime.now(timezone.utc)}})
        token = create_access_token({"sub": str(user["_id"])});
        refresh_token = create_refresh_token({"sub": str(user["_id"])});
        user_out = UserOut(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"]
        )
        response = AuthResponse(
            accessToken=token,
            refreshToken=refresh_token,
            user=user_out
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=response.dict())
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed")
# Add refresh endpoint OUTSIDE login function
@router.post("/refresh", response_model=dict, status_code=status.HTTP_200_OK, summary="Refresh access token", tags=["auth"])
async def refresh_token_endpoint(payload: dict):
    refresh_token = payload.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing refresh token")
    try:
        # Check if token is blacklisted
        if await is_token_blacklisted(refresh_token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalidated (blacklisted)")
        decoded = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = decoded.get("sub")
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        token = create_access_token({"sub": user_id})
        response = {
            "accessToken": token,
            "user": {"id": user_id, "name": user["name"], "email": user["email"]}
        }
        return JSONResponse(status_code=status.HTTP_200_OK, content=jsonable_encoder(response))
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token refresh failed")



@router.post("/logout", status_code=status.HTTP_200_OK, summary="Logout user", tags=["auth"])
async def logout(payload: dict = Body(...)):
    """
    Logout user by blacklisting refresh token.
    Accepts: { "refreshToken": "..." }
    """
    refresh_token = payload.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing refresh token")
    await blacklist_token(refresh_token)
    return {"success": True}


 

