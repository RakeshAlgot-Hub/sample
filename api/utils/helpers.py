from bson import ObjectId

def toObjectId(value: str | None):
    if value and ObjectId.is_valid(value):
        return ObjectId(value)
    return None