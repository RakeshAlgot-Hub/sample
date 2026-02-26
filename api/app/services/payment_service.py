from app.models.payment_schema import Payment
from app.database.mongodb import getCollection
import uuid
from datetime import datetime, timezone

class PaymentService:
    def __init__(self):
        self.collection = getCollection("payments")

    async def get_payments(self, property_id: str = None):
        query = {}
        if property_id:
            query["propertyId"] = property_id
        cursor = self.collection.find(query)
        payments = []
        async for doc in cursor:
            payments.append(Payment(**doc))
        return payments

    async def get_payment(self, payment_id: str):
        doc = await self.collection.find_one({"id": payment_id})
        if doc:
            return Payment(**doc)
        return None

    async def create_payment(self, payment_data: dict):
        now = datetime.now(timezone.utc).isoformat()
        if not payment_data.get("id"):
            payment_data["id"] = str(uuid.uuid4())
        if not payment_data.get("createdAt"):
            payment_data["createdAt"] = now
        if not payment_data.get("updatedAt"):
            payment_data["updatedAt"] = now
        await self.collection.insert_one(payment_data)
        return Payment(**payment_data)

    async def update_payment(self, payment_id: str, payment_data: dict):
        payment_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await self.collection.update_one({"id": payment_id}, {"$set": payment_data})
        doc = await self.collection.find_one({"id": payment_id})
        if doc:
            return Payment(**doc)
        return None

    async def delete_payment(self, payment_id: str):
        await self.collection.delete_one({"id": payment_id})
        return {"success": True, "paymentId": payment_id}
