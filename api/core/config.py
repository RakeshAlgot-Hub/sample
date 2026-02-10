from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # 🔹 Database
    mongoUrl: str = Field(..., alias="MONGO_URL")
    mongoDatabase: str = Field(..., alias="MONGO_DATABASE")
    mongoOwnersCollection: str = Field("owners", alias="MONGO_OWNERS_COLLECTION") # Renamed from users
    mongoPropertyCollection: str = Field("properties", alias="MONGO_PROPERTY_COLLECTION")
    mongoUnitCollection: str = Field("units", alias="MONGO_UNIT_COLLECTION")

    # 🔐 Security
    jwtSecretKey: str = Field(..., alias="JWT_SECRET_KEY")
    jwtAlgorithm: str = Field("HS512", alias="JWT_ALGORITHM")

    accessTokenTtlMinutes: int = Field(15, alias="ACCESS_TOKEN_TTL_MINUTES")
    refreshTokenTtlDays: int = Field(90, alias="REFRESH_TOKEN_TTL_DAYS")

    cookieSecure: bool = Field(True, alias="COOKIE_SECURE")

    # 🪵 Logging (✅ ADD THIS)
    logLevel: str = Field("INFO", alias="LOG_LEVEL")

    class Config:
        env_file = ".env"
        case_sensitive = True
        populate_by_name = True  # 🔥 IMPORTANT


settings = Settings()
