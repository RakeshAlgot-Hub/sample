from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional

class MemberModel:
    def __init__(
        self,
        property_id: ObjectId,
        ownerId: ObjectId,
        name: str,
        phone: str,
        address: str,
        bed_id: Optional[ObjectId] = None,
        isActive: bool = True,
    ):
        self.property_id = property_id
        self.ownerId = ownerId
        self.name = name
        self.phone = phone
        self.address = address
        self.bed_id = bed_id
        self.isActive = isActive
        self.createdAt = datetime.now(timezone.utc)
