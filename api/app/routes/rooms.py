from fastapi import APIRouter, HTTPException, status, Depends
from app.utils.helpers import get_current_user
from app.services.room_service import create_room_service
from app.models.room_schema import RoomCreateRequest
from app.database.mongodb import db
from typing import Optional
from fastapi import Query

router = APIRouter()




@router.post("/rooms", status_code=status.HTTP_201_CREATED)
async def create_room_endpoint(request: RoomCreateRequest, current_user=Depends(get_current_user)):
    # Ownership check
    properties_collection = db["properties"]
    from bson import ObjectId
    try:
        property_id = ObjectId(request.propertyId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid propertyId format")
    property = await properties_collection.find_one({"_id": property_id})
    if not property or property.get("ownerId") != current_user:
        raise HTTPException(status_code=403, detail="Forbidden: Not your property")
    room = await create_room_service(
        request.propertyId,
        request.buildingId,
        request.roomNumber,
        request.floor,
        request.shareType
    )
    if not room:
        raise HTTPException(status_code=404, detail="Property not found")
    return room




@router.get("/rooms", status_code=status.HTTP_200_OK)
async def get_rooms(
    propertyId: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    shareType: Optional[int] = Query(None),
    current_user=Depends(get_current_user)
):
    # Ownership check
    properties_collection = db["properties"]
    from bson import ObjectId
    try:
        property_id = ObjectId(propertyId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid propertyId format")
    property = await properties_collection.find_one({"_id": property_id})
    if not property or property.get("ownerId") != current_user:
        raise HTTPException(status_code=403, detail="Forbidden: Not your property")
    rooms_collection = db["rooms"]
    query = {"propertyId": propertyId}
    if floor:
        query["floor"] = floor
    if shareType is not None:
        query["shareType"] = shareType
    if search:
        query["$or"] = [
            {"roomNumber": {"$regex": search, "$options": "i"}},
        ]
    total = await rooms_collection.count_documents(query)
    cursor = rooms_collection.find(query).skip((page - 1) * limit).limit(limit)
    rooms = []
    async for room in cursor:
        room["id"] = str(room["_id"])
        room.pop("_id", None)
        rooms.append(room)
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "results": rooms
    }

