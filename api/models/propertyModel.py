from datetime import datetime, timezone
from bson import ObjectId

class PropertyModel:
    def __init__(
        self,
        name: str,
        propertyType: str,  # HOSTEL | APARTMENT
        country: str,
        state: str,
        city: str,
        area: str,
        addressLine: str,
        pincode: str,
        phone: str,
        ownerId: ObjectId,
        isActive: bool = True,
        bedPricing: list = [], # Added bedPricing
    ):
        self.name = name
        self.propertyType = propertyType
        self.country = country
        self.state = state
        self.city = city
        self.area = area
        self.addressLine = addressLine
        self.pincode = pincode
        self.phone = phone
        self.ownerId = ownerId
        self.isActive = isActive
        self.bedPricing = bedPricing # Store bedPricing
        self.createdAt = datetime.now(timezone.utc)
        self.updatedAt = datetime.now(timezone.utc)
