from datetime import datetime, timezone
from bson import ObjectId

class FloorModel:
    def __init__(
        self,
        building_id: ObjectId,
        property_id: ObjectId,
        ownerId: ObjectId,
        floor_number: int,
        room_count: int,
        isActive: bool = True,
    ):
        self.building_id = building_id
        self.property_id = property_id
        self.ownerId = ownerId
        self.floor_number = floor_number
        self.room_count = room_count
        self.isActive = isActive
        self.createdAt = datetime.now(timezone.utc)
