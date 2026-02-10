from pydantic_settings import BaseSettings
from pydantic import Field



class Settings(BaseSettings):
    # 🔹 Database
    mongoUrl: str = Field(..., alias="MONGO_URL")
    mongoDatabase: str = Field(..., alias="MONGO_DATABASE")
    mongoOwnersCollection: str = Field("owners", alias="MONGO_OWNERS_COLLECTION")
    mongoPropertyCollection: str = Field("properties", alias="MONGO_PROPERTY_COLLECTION")
    mongoUnitCollection: str = Field("units", alias="MONGO_UNIT_COLLECTION")

    # 🔐 Security
    jwtSecretKey: str = Field(..., alias="JWT_SECRET_KEY")
    jwtAlgorithm: str = Field("HS512", alias="JWT_ALGORITHM")

    accessTokenTtlMinutes: int = Field(15, alias="ACCESS_TOKEN_TTL_MINUTES")
    # Set refresh token to 10 years for long-lived sessions
    refreshTokenTtlDays: int = Field(3650, alias="REFRESH_TOKEN_TTL_DAYS")

    # Secure cookie settings for web (not used by mobile, but good for API security)
    cookieSecure: bool = Field(True, alias="COOKIE_SECURE")
    cookieHttpOnly: bool = Field(True, alias="COOKIE_HTTP_ONLY")
    cookieSameSite: str = Field("Lax", alias="COOKIE_SAMESITE")

    # 🪵 Logging
    logLevel: str = Field("INFO", alias="LOG_LEVEL")

    class Config:
        env_file = ".env"
        case_sensitive = True
        populate_by_name = True

settings = Settings()
