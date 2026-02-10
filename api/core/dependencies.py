from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette import status
from bson import ObjectId

from core.security import (
    verifyToken,
    generateAccessToken,
)
from core.ownersDb import findOwner
from core.config import settings


PUBLIC_PATHS = (
    "/auth/login",
    "/auth/register",
    "/docs",
    "/openapi.json",
    "/redoc",
)


class JwtAuthMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, callNext):

        if request.method == "OPTIONS":
            return await callNext(request)

        if any(request.url.path.startswith(p) for p in PUBLIC_PATHS):
            return await callNext(request)

        accessToken = request.cookies.get("__Secure-access")
        refreshToken = request.cookies.get("__Secure-refresh")

        if not accessToken:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required"},
            )

        payload = verifyToken(accessToken)

        if not payload:
            if not refreshToken:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Session expired. Please login again"},
                )

            refreshPayload = verifyToken(refreshToken)
            if not refreshPayload or refreshPayload.get("type") != "refresh":
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid refresh token"},
                )

            userId = refreshPayload.get("uid")
            print(userId)
            user = findOwner({"_id": userId})
            print("User fetched during refresh:", user)

            if not user or not user.get("isActive", True):
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "User not found or inactive"},
                )

            newAccessToken = generateAccessToken(userId=str(user["_id"]))

            request.state.user = {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "fullName": user["fullName"],
                "phoneNumber": user["phoneNumber"],
                "isActive": user.get("isActive", True),
            }

            response = await callNext(request)
            response.set_cookie(
                key="__Secure-access",
                value=newAccessToken,
                httponly=True,
                secure=settings.cookieSecure,
                samesite="strict",
                max_age=settings.accessTokenTtlMinutes * 60,
                path="/",
            )
            return response

        if payload.get("type") != "access":
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid token type"},
            )

        userId = payload.get("uid")
        user = findOwner({"_id": ObjectId(userId)})

        if not user or not user.get("isActive", True):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "User not found or inactive"},
            )

        request.state.user = {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "fullName": user["fullName"],
            "phoneNumber": user["phoneNumber"],
            "isActive": user.get("isActive", True),
        }

        return await callNext(request)
