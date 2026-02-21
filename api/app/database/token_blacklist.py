from .mongodb import db

blacklist_collection = db["token_blacklist"]

async def blacklist_token(token: str):
    await blacklist_collection.insert_one({"token": token})

async def is_token_blacklisted(token: str) -> bool:
    return await blacklist_collection.find_one({"token": token}) is not None
