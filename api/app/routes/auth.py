from fastapi import APIRouter, status, Request
from app.utils.rate_limit import rate_limit_dep
from app.services.auth_service import (
    register_user_service,
    login_user_service,
    refresh_token_service,
    logout_user_service,
    google_sign_in_service,
    send_email_otp_service,
    verify_email_otp_service,
    get_current_user_service,
)
from app.models.user_schema import (
    UserCreate,
    UserLogin,
    RefreshTokenRequest,
    LogoutRequest,
    GoogleSignInRequest,
    EmailSendOTPRequest,
    EmailVerifyOTPRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Register a new user", tags=["auth"])
async def register(user: UserCreate):
    return await register_user_service(user)


@router.post("/login", status_code=status.HTTP_200_OK, summary="Authenticate user and return JWT", tags=["auth"])
@rate_limit_dep
async def login(request: Request, data: UserLogin):
    return await login_user_service(data)


@router.post("/google", status_code=status.HTTP_200_OK, summary="Google sign in", tags=["auth"])
async def google_sign_in(payload: GoogleSignInRequest):
    return await google_sign_in_service(payload)


@router.post("/email/send-otp", status_code=status.HTTP_200_OK, summary="Send email verification OTP", tags=["auth"])
async def send_email_otp(payload: EmailSendOTPRequest):
    return await send_email_otp_service(payload.email)


@router.post("/email/verify-otp", status_code=status.HTTP_200_OK, summary="Verify email OTP", tags=["auth"])
async def verify_email_otp(payload: EmailVerifyOTPRequest):
    return await verify_email_otp_service(payload.email, payload.otp)


@router.post("/refresh", status_code=status.HTTP_200_OK, summary="Refresh access token", tags=["auth"])
async def refresh_token_endpoint(payload: RefreshTokenRequest):
    return await refresh_token_service(payload)


@router.post("/logout", status_code=status.HTTP_200_OK, summary="Logout user", tags=["auth"])
async def logout(payload: LogoutRequest):
    return await logout_user_service(payload)


@router.get("/me", status_code=status.HTTP_200_OK, summary="Get current user", tags=["auth"])
async def get_current_user(request: Request):
    return await get_current_user_service(request)
