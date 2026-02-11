from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Request

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "mydatabase"

class MongoDB:
    def __init__(self, url: str = MONGODB_URL, db_name: str = DATABASE_NAME):
        self.client = AsyncIOMotorClient(url)
        self.db = self.client[db_name]

mongodb = MongoDB()

def get_db(request: Request):
    return request.app.state.mongodb
