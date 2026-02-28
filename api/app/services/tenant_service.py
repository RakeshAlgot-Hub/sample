from app.models.tenant_schema import Tenant
from app.models.bed_schema import BedUpdate
from app.services.bed_service import update_bed_service
from app.database.mongodb import getCollection
import uuid
from datetime import datetime, timezone
from bson import ObjectId
from app.models.payment_schema import PaymentCreate
from app.services.payment_service import create_payment
class TenantService:
    async def is_property_owner(self, user_id: str, property_id: str) -> bool:
        from app.database.mongodb import db
        prop = await db["properties"].find_one({"_id": ObjectId(property_id), "ownerId": ObjectId(user_id)})
        return prop is not None

    def __init__(self):
        self.collection = getCollection("tenants")

    async def get_tenants(self, property_id: str = None):
        query = {}
        if property_id:
            query["propertyId"] = property_id
        cursor = self.collection.find(query)
        tenants = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            tenants.append(Tenant(**doc))
        return tenants

    async def get_tenant(self, tenant_id: str):
        doc = await self.collection.find_one({"_id": ObjectId(tenant_id)})
        if doc:
            doc["id"] = str(doc["_id"])
            return Tenant(**doc)
        return None

    async def create_tenant(self, tenant_data: dict):
        now = datetime.now(timezone.utc).isoformat()
        if not tenant_data.get("createdAt"):
            tenant_data["createdAt"] = now
        if not tenant_data.get("updatedAt"):
            tenant_data["updatedAt"] = now
        # Set bed status to occupied if bedId is present
        if tenant_data.get("bedId"):
            await update_bed_service(tenant_data["bedId"], BedUpdate(status="occupied"))
        # Ensure billingConfig is present and stored
        billing_config = tenant_data.get("billingConfig")
        if billing_config:
            tenant_data["billingConfig"] = billing_config
        result = await self.collection.insert_one(tenant_data)
        tenant_data["id"] = str(result.inserted_id)

        # Auto-generate payment if enabled
        if billing_config and getattr(billing_config, "autoGenerate", False):

            payment = PaymentCreate(
                tenantId=tenant_data["id"],
                propertyId=tenant_data["propertyId"],
                tenantName=tenant_data["name"],
                property=tenant_data.get("propertyId", ""),
                bed=tenant_data.get("bedId", ""),
                amount=tenant_data["rent"],
                status="due",
                dueDate=billing_config.anchorDate,
                date=None,
                method=None
            )
            await create_payment(payment)

        return Tenant(**tenant_data)

    async def update_tenant(self, tenant_id: str, tenant_data: dict):
        tenant_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        # Check if bedId is being changed
        orig_doc = await self.collection.find_one({"_id": ObjectId(tenant_id)})
        orig_bed_id = orig_doc.get("bedId") if orig_doc else None
        new_bed_id = tenant_data.get("bedId")
        if orig_bed_id and orig_bed_id != new_bed_id:
            # Set previous bed to available
            await update_bed_service(orig_bed_id, BedUpdate(status="available"))
        if new_bed_id and orig_bed_id != new_bed_id:
            # Set new bed to occupied
            await update_bed_service(new_bed_id, BedUpdate(status="occupied"))
        # Ensure billingConfig is present and stored
        if "billingConfig" in tenant_data:
            tenant_data["billingConfig"] = tenant_data["billingConfig"] or None
        await self.collection.update_one({"_id": ObjectId(tenant_id)}, {"$set": tenant_data})
        doc = await self.collection.find_one({"_id": ObjectId(tenant_id)})
        if doc:
            doc["id"] = str(doc["_id"])
            return Tenant(**doc)
        return None

    async def delete_tenant(self, tenant_id: str):
        # Find the tenant to get the bedId
        doc = await self.collection.find_one({"_id": ObjectId(tenant_id)})
        bed_id = doc.get("bedId") if doc else None
        if bed_id:
            await update_bed_service(bed_id, BedUpdate(status="available"))
        await self.collection.delete_one({"_id": ObjectId(tenant_id)})
        return {"success": True, "tenantId": tenant_id}
