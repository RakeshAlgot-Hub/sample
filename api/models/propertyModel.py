from datetime import datetime, timezone
from bson import ObjectId


class PropertyModel:
    def __init__(
        self,
        name: str,
        propertyType: str,  # HOSTEL | APARTMENT
        city: str = None,
        area: str = None,
        ownerId: ObjectId = None,
        isActive: bool = True,
        bedPricing: list = [],
        totalRooms: int = 0,
        totalBeds: int = 0,
        createdAt: datetime = None,
    ):
        self.name = name
        self.propertyType = propertyType
        self.city = city
        self.area = area
        self.ownerId = ownerId
        self.isActive = isActive
        self.bedPricing = bedPricing
        self.totalRooms = totalRooms
        self.totalBeds = totalBeds
        self.createdAt = createdAt if createdAt is not None else datetime.now(timezone.utc)
        self.updatedAt = datetime.now(timezone.utc)
