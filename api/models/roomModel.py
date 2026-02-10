from datetime import datetime, timezone
from bson import ObjectId

class RoomModel:
    def __init__(
        self,
        floor_id: ObjectId,
        building_id: ObjectId,
        property_id: ObjectId,
        ownerId: ObjectId,
        room_number: str,
        share_type: int, # This is the number of beds
        isActive: bool = True,
    ):
        self.floor_id = floor_id
        self.building_id = building_id
        self.property_id = property_id
        self.ownerId = ownerId
        self.room_number = room_number
        self.share_type = share_type
        self.isActive = isActive
        self.createdAt = datetime.now(timezone.utc)
