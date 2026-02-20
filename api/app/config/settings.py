import os

class Settings:
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"

settings = Settings()
