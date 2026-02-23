from fastapi import Body, APIRouter, status, Request
from app.utils.rate_limit import rate_limit_dep
from app.services.auth_service import register_user_service, login_user_service, refresh_token_service, logout_user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Register a new user", tags=["auth"])
async def register(user):
    return register_user_service(user)


#
@router.post("/login", status_code=status.HTTP_200_OK, summary="Authenticate user and return JWT", tags=["auth"])
@rate_limit_dep
async def login(request: Request, data):
    return login_user_service(data)

# Add refresh endpoint OUTSIDE login function
@router.post("/refresh", status_code=status.HTTP_200_OK, summary="Refresh access token", tags=["auth"])
async def refresh_token_endpoint(payload: dict):
    return refresh_token_service(payload)




@router.post("/logout", status_code=status.HTTP_200_OK, summary="Logout user", tags=["auth"])
async def logout(payload: dict = Body(...)):
    return logout_user_service(payload)


 

