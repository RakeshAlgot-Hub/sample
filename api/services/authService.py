# services/authService.py

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from core.security import verifyToken
from fastapi import HTTPException, status

from core.ownersDb import (
    findOwner,
    createOwner,
    updateOwner,
    findOwnerById, # Added findOwnerById
)
from models.authUserModel import AuthUserModel
from schemas.authUserSchema import (
    UserCreateSchema,
    UserLoginSchema,
    UserResponseSchema,
    DeviceMetaData,
    TokenRefreshSchema, # Added TokenRefreshSchema
)
from utils.security import hashPassword, verifyPassword
from core.security import generateAccessToken, generateRefreshToken
from core.config import settings

logger = logging.getLogger(__name__)

MAX_FAILED_ATTEMPTS = 5
LOCK_TIME_MINUTES = 15


# -----------------------------
# Helper: account lock check
# -----------------------------
def isAccountLocked(user: dict) -> bool:
    if user.get("failedLoginAttempts", 0) < MAX_FAILED_ATTEMPTS:
        return False

    lastFailed = user.get("lastFailedLoginAt")
    if not lastFailed:
        return False

    lockUntil = lastFailed + timedelta(minutes=LOCK_TIME_MINUTES)
    return datetime.now(timezone.utc) < lockUntil


# -----------------------------
# Helper: Update or add user device metadata
# -----------------------------
def _updateUserDevice(user_doc: dict, new_device: DeviceMetaData) -> List[Dict[str, Any]]:
    updated_devices = []
    found = False
    for device in user_doc.get("devices", []):
        if device.get("deviceId") == new_device.deviceId:
            # Update existing device's metadata
            updated_devices.append(new_device.dict())
            found = True
        else:
            updated_devices.append(device)
    if not found:
        # Add new device
        updated_devices.append(new_device.dict())
    return updated_devices


# -----------------------------
# Register
# -----------------------------
async def registerUserService(payload: UserCreateSchema) -> UserResponseSchema:
    try:
        # Check if email or phone number already exists
        query_conditions = []
        if payload.email:
            query_conditions.append({"email": payload.email})
        if payload.phoneNumber:
            query_conditions.append({"phoneNumber": payload.phoneNumber})

        if query_conditions:
            existingUser = findOwner({"$or": query_conditions})
            if existingUser:
                detail_msg = ""
                if payload.email and existingUser.get("email") == payload.email:
                    detail_msg += "Email already registered. "
                if payload.phoneNumber and existingUser.get("phoneNumber") == payload.phoneNumber:
                    detail_msg += "Phone number already registered. "
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=detail_msg.strip(),
                )

        # Create new user
        user = AuthUserModel(
            fullName=payload.fullName,
            email=payload.email,
            phoneNumber=payload.phoneNumber,
            hashedPassword=hashPassword(payload.password),
            devices=[payload.device.dict()], # Store initial device
            createdAt=datetime.now(timezone.utc),
        )

        result = createOwner(user.__dict__)
        user_id = str(result["id"])

        # Generate tokens for the new user
        accessToken = generateAccessToken(userId=user_id)
        refreshToken = generateRefreshToken(userId=user_id, deviceId=payload.device.deviceId)

        return UserResponseSchema(
            id=user_id,
            fullName=user.fullName,
            email=user.email,
            phoneNumber=user.phoneNumber,
            role=user.role,
            isActive=user.isActive,
            isEmailVerified=user.isEmailVerified,
            createdAt=user.createdAt,
            accessToken=accessToken,
            refreshToken=refreshToken,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Register failed | unexpected error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user",
        )



# -----------------------------
# Login (SECURED)
# -----------------------------
async def loginUserService(payload: UserLoginSchema) -> UserResponseSchema:
    try:
        # Find user by email or phone number
        query_conditions = []
        if payload.email:
            query_conditions.append({"email": payload.email})
        if payload.phoneNumber:
            query_conditions.append({"phoneNumber": payload.phoneNumber})
        
        user_doc = findOwner({"$or": query_conditions})

        if not user_doc:
            logger.warning("Login failed | user not found | email/phone=%s/%s", payload.email, payload.phoneNumber)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Check account lock status
        if isAccountLocked(user_doc):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account temporarily locked. Try again later.",
            )

        # Verify password
        if not verifyPassword(payload.password, user_doc["hashedPassword"]):
            updateOwner(
                {"_id": user_doc["_id"]},
                {
                    "failedLoginAttempts": user_doc.get("failedLoginAttempts", 0) + 1,
                    "lastFailedLoginAt": datetime.now(timezone.utc),
                },
            )
            logger.warning("Login failed | invalid password | email/phone=%s/%s", payload.email, payload.phoneNumber)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Reset failed login attempts on successful login
        updateOwner(
            {"_id": user_doc["_id"]},
            {
                "failedLoginAttempts": 0,
                "lastFailedLoginAt": None,
            },
        )

        user_id = str(user_doc["_id"])

        # Update user's device list
        updated_devices = _updateUserDevice(user_doc, payload.device)
        updateOwner({"_id": user_doc["_id"]}, {"devices": updated_devices})

        # Generate tokens
        accessToken = generateAccessToken(userId=user_id)
        refreshToken = generateRefreshToken(userId=user_id, deviceId=payload.device.deviceId)

        logger.info("Login success | userId=%s", user_id)

        return UserResponseSchema(
            id=user_id,
            fullName=user_doc["fullName"],
            email=user_doc.get("email"),
            phoneNumber=user_doc.get("phoneNumber"),
            role=user_doc.get("role", "owner"),
            isActive=user_doc.get("isActive", True),
            isEmailVerified=user_doc.get("isEmailVerified", False),
            createdAt=user_doc["createdAt"],
            accessToken=accessToken,
            refreshToken=refreshToken,
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Login failed | unexpected error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed",
        )


# -----------------------------
# Logout
# -----------------------------
async def logoutUserService(userId: str, deviceId: str) -> dict:
    try:
        user_doc = findOwnerById(userId)
        if not user_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Remove the specific device from the user's device list
        updated_devices = [
            device for device in user_doc.get("devices", []) if device.get("deviceId") != deviceId
        ]
        updateOwner({"_id": user_doc["_id"]}, {"devices": updated_devices})

        logger.info("Logout success | userId=%s | deviceId=%s", userId, deviceId)
        return {"message": "Logged out successfully from this device"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Logout failed | unexpected error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed",
        )


# -----------------------------
# Refresh Tokens
# -----------------------------
async def refreshUserService(payload: TokenRefreshSchema) -> UserResponseSchema:
    try:
        refresh_payload = verifyToken(payload.refreshToken)

        if not refresh_payload or refresh_payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
        user_id = refresh_payload.get("uid")
        device_id = refresh_payload.get("deviceId") # Get deviceId from refresh token payload

        if not user_id or not device_id or device_id != payload.deviceId:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token or device")

        user_doc = findOwnerById(user_id)
        if not user_doc or not user_doc.get("isActive", True):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

        # Verify if the device is still registered with the user
        device_registered = any(d.get("deviceId") == device_id for d in user_doc.get("devices", []))
        if not device_registered:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Device not registered with user")

        # Generate new access token and a new refresh token (optional, for sliding sessions)
        new_accessToken = generateAccessToken(userId=user_id)
        new_refreshToken = generateRefreshToken(userId=user_id, deviceId=device_id) # Regenerate refresh token for same device

        logger.info("Token refresh success | userId=%s | deviceId=%s", user_id, device_id)

        return UserResponseSchema(
            id=user_id,
            fullName=user_doc["fullName"],
            email=user_doc.get("email"),
            phoneNumber=user_doc.get("phoneNumber"),
            role=user_doc.get("role", "owner"),
            isActive=user_doc.get("isActive", True),
            isEmailVerified=user_doc.get("isEmailVerified", False),
            createdAt=user_doc["createdAt"],
            accessToken=new_accessToken,
            refreshToken=new_refreshToken,
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Token refresh failed | unexpected error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed",
        )
