from datetime import datetime, timezone
from bson import ObjectId

class BuildingModel:
    def __init__(
        self,
        property_id: ObjectId,
        name: str,
        floor_count: int,
        ownerId: ObjectId,
        isActive: bool = True,
    ):
        self.property_id = property_id
        self.name = name
        self.floor_count = floor_count
        self.ownerId = ownerId
        self.isActive = isActive
        self.createdAt = datetime.now(timezone.utc)
