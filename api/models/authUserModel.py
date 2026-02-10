from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

class AuthUserModel:
    def __init__(
        self,
        fullName: str,
        hashedPassword: str,
        email: Optional[str] = None,
        phoneNumber: Optional[str] = None,
        role: str = "owner",
        isActive: bool = True,
        isEmailVerified: bool = False,
        createdAt: Optional[datetime] = None,
        failedLoginAttempts: int = 0,
        lastFailedLoginAt: Optional[datetime] = None,
        devices: Optional[List[Dict[str, Any]]] = None, # List of device metadata
    ):
        self.fullName = fullName
        self.email = email
        self.phoneNumber = phoneNumber
        self.hashedPassword = hashedPassword
        self.role = role
        self.isActive = isActive
        self.isEmailVerified = isEmailVerified
        self.createdAt = createdAt or datetime.now(timezone.utc)
        self.failedLoginAttempts = failedLoginAttempts
        self.lastFailedLoginAt = lastFailedLoginAt
        self.devices = devices if devices is not None else []

