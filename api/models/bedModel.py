from datetime import datetime, timezone
from bson import ObjectId

class BedModel:
    def __init__(
        self,
        room_id: ObjectId,
        property_id: ObjectId,
        ownerId: ObjectId,
        bed_number: int,
        is_occupied: bool = False,
    ):
        self.room_id = room_id
        self.property_id = property_id
        self.ownerId = ownerId
        self.bed_number = bed_number
        self.is_occupied = is_occupied
        self.createdAt = datetime.now(timezone.utc)
