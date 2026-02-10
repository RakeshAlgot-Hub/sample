from datetime import datetime, timezone


class AuthUserModel:
    def __init__(
        self,
        email: str,
        phoneNumber: str,
        hashedPassword: str,
        createdAt: datetime | None = None,
    ):
        self.email = email
        self.phoneNumber = phoneNumber
        self.hashedPassword = hashedPassword
        self.createdAt = createdAt or datetime.now(timezone.utc)

