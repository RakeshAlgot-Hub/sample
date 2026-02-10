# api/routes/authRoutes.py
from fastapi import APIRouter, HTTPException, status, Request, Header, Depends # Added Header and Depends
from schemas.authUserSchema import (
    UserLoginSchema,
    UserCreateSchema,
    UserResponseSchema,
    TokenRefreshSchema, # Added TokenRefreshSchema
)
from services.authService import (
    loginUserService,
    logoutUserService,
    registerUserService,
    refreshUserService, # Added refreshUserService
)
from core.rateLimiter import limiter

# Assuming this dependency is available from somewhere (e.g., core.dependencies)
# For now, we'll extract userId from request.state.user, which JwtAuthMiddleware attaches
def get_current_user_id(request: Request) -> str:
    if not hasattr(request.state, "user") or not request.state.user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return request.state.user["id"]

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=UserResponseSchema)
@limiter.limit("5/minute")  # prevent spam registrations
async def registerUser(request: Request, payload: UserCreateSchema):
    return await registerUserService(payload)


@router.post("/login", response_model=UserResponseSchema)
@limiter.limit("5/minute")  # prevent brute-force login
async def loginUser(request: Request, payload: UserLoginSchema):
    print("Login attempt for user:", payload.email)
    return await loginUserService(payload)


@router.post("/logout", response_model=dict) # Changed response_model to dict
@limiter.limit("10/minute")  # avoid abuse
async def logoutUser(
    request: Request,
    userId: str = Depends(get_current_user_id),
    deviceId: str = Header(..., alias="X-Device-Id"), # Expect deviceId in X-Device-Id header
):
    print("Logout attempt for userId:", userId, "from deviceId:", deviceId)
    return await logoutUserService(userId, deviceId)


@router.post("/refresh", response_model=UserResponseSchema) # New refresh endpoint
@limiter.limit("5/minute")
async def refreshTokens(request: Request, payload: TokenRefreshSchema):
    return await refreshUserService(payload)


@router.get("/me", response_model=UserResponseSchema)
async def getMe(request: Request):
    return request.state.user
