# api/core/security.py
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import secrets
from core.config import settings


def _buildSecurePayload(payload: dict, ttl: timedelta) -> dict:
    now = datetime.now(timezone.utc)

    return {
        **payload,
        "iat": now,
        "exp": now + ttl,
        "jti": secrets.token_hex(32),
        "iss": "hostel-api",
        "aud": "hostel-client",
    }


def generateAccessToken(
    userId: str,
) -> str:
    payload = {"uid": userId, "type": "access"}
    securePayload = _buildSecurePayload(
        payload,
        timedelta(minutes=settings.accessTokenTtlMinutes),
    )

    return jwt.encode(
        securePayload,
        settings.jwtSecretKey,
        algorithm=settings.jwtAlgorithm,
    )


def generateRefreshToken(userId: str, deviceId: str) -> str:
    payload = _buildSecurePayload(
        {"uid": userId, "type": "refresh", "deviceId": deviceId},
        timedelta(days=settings.refreshTokenTtlDays),
    )

    return jwt.encode(
        payload,
        settings.jwtSecretKey,
        algorithm=settings.jwtAlgorithm,
    )


def verifyToken(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            settings.jwtSecretKey,
            algorithms=[settings.jwtAlgorithm],
            audience="hostel-client",
            issuer="hostel-api",
        )
    except JWTError:
        return None
