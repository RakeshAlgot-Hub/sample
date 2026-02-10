# services/authService.py

import logging
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status, Response

from core.ownersDb import (
    findOwner,
    createOwner,
    updateOwner,
)
from models.authUserModel import AuthUserModel
from schemas.authUserSchema import (
    UserCreateSchema,
    UserLoginSchema,
    UserResponseSchema,
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
# Register
# -----------------------------
async def registerUserService(payload: UserCreateSchema) -> UserResponseSchema:
    try:
        # 🔍 Check name
        if payload.name:
            existingname = findOwner({"name": payload.name})
            if existingname:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="name already exists",
                )

        # 🔍 Check email
        if payload.email:
            existingEmail = findOwner({"email": payload.email})
            if existingEmail:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists",
                )

        user = AuthUserModel(
            name=payload.name,
            email=payload.email,
            hashedPassword=hashPassword(payload.password),
            isActive=True,
            failedLoginAttempts=0,
            lastFailedLoginAt=None,
            createdAt=datetime.now(timezone.utc),
        )

        result = createOwner(user.__dict__)

        return UserResponseSchema(
            id=str(result["id"]),
            name=user.name,
            email=user.email,
            fullName=user.fullName,
            phoneNumber=user.phoneNumber,
            isActive=True,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user",
        )


# -----------------------------
# Login (SECURED)
# -----------------------------
async def loginUserService(payload: UserLoginSchema, response: Response) -> UserResponseSchema:
    try:
        print("Login attempt for email:", payload.email)
        user = findOwner(
            {
                "$or": [
                    {"name": payload.email},
                    {"phoneNumber": payload.email},
                ]
            }
        )

        if user and isAccountLocked(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account temporarily locked. Try again later.",
            )

        if not user or not verifyPassword(payload.password, user["hashedPassword"]):
            if user:
                updateOwner(
                    {"_id": user["_id"]},
                    {
                        "failedLoginAttempts": user.get("failedLoginAttempts", 0) + 1,
                        "lastFailedLoginAt": datetime.now(timezone.utc),
                    },
                )
            print("Invalid login attempt for email:", payload.email)

            logger.warning("Login failed | invalid credentials | email=%s", payload.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        updateOwner(
            {"_id": user["_id"]},
            {
                "failedLoginAttempts": 0,
                "lastFailedLoginAt": None,
            },
        )

        accessToken = generateAccessToken(userId=str(user["_id"]))

        refreshToken = generateRefreshToken(str(user["_id"]))

        response.set_cookie(
            key="__Secure-access",
            value=accessToken,
            httponly=True,
            secure=settings.cookieSecure,
            samesite="strict",
            max_age=settings.accessTokenTtlMinutes * 60,
            path="/",
        )

        response.set_cookie(
            key="__Secure-refresh",
            value=refreshToken,
            httponly=True,
            secure=settings.cookieSecure,
            samesite="strict",
            max_age=settings.refreshTokenTtlDays * 24 * 60 * 60,
            path="/auth/refresh",
        )

        logger.info("Login success | userId=%s", str(user["_id"]))

        return UserResponseSchema(
            id=str(user["_id"]),
            name=user["name"],
            fullName=user["fullName"],
            email=user["email"],
            phoneNumber=user["phoneNumber"],
            isActive=user.get("isActive", True),
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
async def logoutUserService(response: Response) -> dict:
    logger.info("User logout")

    response.delete_cookie(
        key="__Secure-access",
        path="/",
        secure=settings.cookieSecure,
        samesite="strict",
    )
    response.delete_cookie(
        key="__Secure-refresh",
        path="/auth/refresh",
        secure=settings.cookieSecure,
        samesite="strict",
    )

    return {"message": "Logged out successfully"}
