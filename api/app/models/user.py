from typing import Optional
from pydantic import EmailStr
from bson import ObjectId

class User:
    def __init__(self, email: EmailStr, name: str, hashed_password: str, _id: Optional[ObjectId] = None, id: Optional[str] = None):
        self.email = email
        self.name = name
        self.hashed_password = hashed_password
        # Prefer explicit id, then _id, else None
        if id is not None:
            self.id = str(id)
        elif _id is not None:
            self.id = str(_id)
        else:
            self.id = None

    def to_dict(self):
        return {
            "_id": ObjectId(self.id) if self.id else None,
            "email": self.email,
            "name": self.name,
            "hashed_password": self.hashed_password,
        }

    @staticmethod
    def from_mongo(data):
        return User(
            email=data["email"],
            name=data["name"],
            hashed_password=data["hashed_password"],
            _id=data.get("_id"),
            id=str(data.get("_id")) if data.get("_id") else None
        )
