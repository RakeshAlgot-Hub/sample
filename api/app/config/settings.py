import os

class Settings:
    mongoUrl: str = os.getenv("MONGO_URL")
    # debug removed (not used)

settings = Settings()

if not settings.mongoUrl:
    raise RuntimeError("MONGO_URL must be set")