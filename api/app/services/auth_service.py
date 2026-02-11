from bson import ObjectId
async def get_user_by_id(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return None
    user = await mongodb.db["users"].find_one({"_id": obj_id})
    return User.from_mongo(user) if user else None
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.db.mongodb import mongodb
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

async def get_user_by_email(email: str):
    user = await mongodb.db["users"].find_one({"email": email})
    return User.from_mongo(user) if user else None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def create_user(user_in: UserCreate):
    existing = await get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "email": user_in.email,
        "name": user_in.name,
        "hashed_password": hashed_password
    }
    result = await mongodb.db["users"].insert_one(user_data)
    user_data["id"] = str(result.inserted_id)
    return User(email=user_data["email"], name=user_data["name"], hashed_password=user_data["hashed_password"], id=user_data["id"])

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
