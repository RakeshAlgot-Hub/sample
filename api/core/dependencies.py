from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette import status
from bson import ObjectId

from core.security import verifyToken
from core.ownersDb import findOwner

PUBLIC_PATHS = (
    "/auth/login",
    "/auth/signup",
    "/auth/logout",
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

        # Try to get access token from Authorization header or cookie
        accessToken = None
        print("Checking authentication for path:", request.url.path)
        auth_header = request.headers.get("Authorization")
        print("Authorization header:", auth_header)
        if auth_header and auth_header.startswith("Bearer "):
            accessToken = auth_header.split(" ")[1]
        elif request.cookies.get("__Secure-access"):  # Fallback to cookie for existing flows if needed, though mobile will use header
            accessToken = request.cookies.get("__Secure-access")

        if not accessToken:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required"},
            )

        # Verify the access token
        payload = verifyToken(accessToken)

        if not payload or payload.get("type") != "access":
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired access token"},
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
            "fullName": user["fullName"],
            "email": user.get("email"),
            "phoneNumber": user.get("phoneNumber"),
            "role": user.get("role", "owner"),
            "isActive": user.get("isActive", True),
            "isEmailVerified": user.get("isEmailVerified", False),
            "createdAt": user["createdAt"],
        }

        return await callNext(request)
