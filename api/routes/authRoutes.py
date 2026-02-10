# api/routes/authRoutes.py
from fastapi import APIRouter, Response, Request
from schemas.authUserSchema import (
    UserLoginSchema,
    UserCreateSchema,
    UserResponseSchema,
)
from services.authService import (
    loginUserService,
    logoutUserService,
    registerUserService,
)
from core.rateLimiter import limiter  

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=UserResponseSchema)
@limiter.limit("5/minute")  # prevent spam registrations
async def registerUser(request: Request, payload: UserCreateSchema):
    return await registerUserService(payload)


@router.post("/login", response_model=UserResponseSchema)
@limiter.limit("5/minute")  # prevent brute-force login
async def loginUser(request: Request, payload: UserLoginSchema, response: Response):
    print("Login attempt for user:", payload.email)
    return await loginUserService(payload, response)


@router.post("/logout")
@limiter.limit("10/minute")  # avoid abuse
async def logoutUser(request: Request, response: Response):
    print("Logout attempt")
    return await logoutUserService(response)


@router.get("/me", response_model=UserResponseSchema)
async def getMe(request: Request):
    return request.state.user
