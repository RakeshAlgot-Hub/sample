import os

class Settings:
    mongoUrl: str = os.getenv("MONGO_URL")
    debug: bool = os.getenv("DEBUG", "False") == "True"

settings = Settings()

if not settings.mongoUrl:
    raise RuntimeError("MONGO_URL must be set")