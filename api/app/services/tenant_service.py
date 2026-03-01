from app.models.tenant_schema import Tenant, TenantOut
from app.models.bed_schema import BedUpdate
from app.services.bed_service import BedService
from app.database.mongodb import getCollection
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from bson import ObjectId
from app.models.payment_schema import PaymentCreate
from app.services.payment_service import PaymentService
from app.models.tenant_schema import BillingConfig



bed_service = BedService()
payment_service = PaymentService()
class TenantService:

    def __init__(self):
        self.collection = getCollection("tenants")

    async def get_tenants(self, property_id: str = None, search: str = None, status: str = None, skip: int = 0, limit: int = 50, include_room_bed: bool = True):
        query = {}
        if property_id:
            query["propertyId"] = property_id
        if search:
            # Search in name, phone, documentId
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}},
                {"documentId": {"$regex": search, "$options": "i"}}
            ]
        if status:
            # Filter by billingConfig.status
            query["billingConfig.status"] = status
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get paginated results
        cursor = self.collection.find(query).skip(skip).limit(limit)
        tenants = []
        
        # Get collections for enrichment
        rooms_collection = getCollection("rooms") if include_room_bed else None
        beds_collection = getCollection("beds") if include_room_bed else None
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            
            # Enrich with room and bed numbers to avoid extra API calls
            if include_room_bed:
                try:
                    # Try to get room info from roomId directly
                    if doc.get("roomId"):
                        room_doc = await rooms_collection.find_one({"_id": ObjectId(doc["roomId"])})
                        if room_doc:
                            doc["roomNumber"] = room_doc.get("roomNumber")
                    
                    # Get bed info from bedId
                    if doc.get("bedId"):
                        bed_doc = await beds_collection.find_one({"_id": ObjectId(doc["bedId"])})
                        if bed_doc:
                            doc["bedNumber"] = bed_doc.get("bedNumber")
                except Exception as e:
                    pass  # If lookup fails, continue without enrichment
            
            tenants.append(TenantOut(**doc))
        return tenants, total

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
            await bed_service.update_bed(tenant_data["bedId"], BedUpdate(status="occupied"))
        # Get autoGeneratePayments flag
        auto_generate = tenant_data.get("autoGeneratePayments", True)
        
        # Ensure billingConfig is present and stored only if auto-generating payments
        billing_config = None
        if auto_generate and tenant_data.get("billingConfig"):
            billing_config = tenant_data.get("billingConfig")
            # Ensure billing_config is a BillingConfig model, not a dict
            if isinstance(billing_config, dict):
                billing_config = BillingConfig(**billing_config)
            # Convert to dict for MongoDB
            tenant_data["billingConfig"] = billing_config.model_dump()
        elif not auto_generate:
            # Remove billingConfig if auto-generate is disabled
            tenant_data.pop("billingConfig", None)
        
        result = await self.collection.insert_one(tenant_data)
        tenant_data["id"] = str(result.inserted_id)

        # Create payment only if autoGeneratePayments is True and billingConfig exists
        if auto_generate and billing_config:
            # Calculate dueDate from anchorDate and billingCycle
            anchor_day = int(billing_config.anchorDate) if billing_config.anchorDate.isdigit() else 1
            today = datetime.now(timezone.utc)
            
            # For monthly billing, set dueDate to anchorDate day of current or next month
            if billing_config.billingCycle == 'monthly':
                # Try current month first
                try:
                    due_date = today.replace(day=anchor_day)
                    # If the anchor day has already passed this month, use next month
                    if due_date < today:
                        due_date = due_date + relativedelta(months=1)
                except ValueError:
                    # If anchor_day doesn't exist in current month (e.g., 31 in Feb), use last day
                    due_date = today.replace(day=1) + relativedelta(months=1, days=-1)
            else:
                # For day-wise billing, use join date as first due date
                due_date = datetime.fromisoformat(tenant_data.get("joinDate", today.isoformat()))
            
            payment = PaymentCreate(
                tenantId=tenant_data["id"],
                propertyId=tenant_data["propertyId"],
                bed=tenant_data.get("bedId", ""),
                amount=tenant_data["rent"],
                status=billing_config.status,
                dueDate=due_date.strftime("%Y-%m-%d"),
                method=billing_config.method
            )
            await payment_service.create_payment(payment)

        return Tenant(**tenant_data)

    async def update_tenant(self, tenant_id: str, tenant_data: dict):
        tenant_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        # Check if bedId is being changed
        orig_doc = await self.collection.find_one({"_id": ObjectId(tenant_id)})
        orig_bed_id = orig_doc.get("bedId") if orig_doc else None
        new_bed_id = tenant_data.get("bedId")
        if orig_bed_id and orig_bed_id != new_bed_id:
            # Set previous bed to available
            await bed_service.update_bed(orig_bed_id, BedUpdate(status="available"))
        if new_bed_id and orig_bed_id != new_bed_id:
            # Set new bed to occupied
            await bed_service.update_bed(new_bed_id, BedUpdate(status="occupied"))
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
            await bed_service.update_bed(bed_id, BedUpdate(status="available"))
        await self.collection.delete_one({"_id": ObjectId(tenant_id)})
        return {"success": True, "tenantId": tenant_id}

    async def generate_monthly_payments(self):
        """
        Production-ready scheduled task to generate recurring monthly payments.
        Runs daily and creates payments for tenants with autoGeneratePayments=true.
        
        Logic:
        - For 'monthly' billing: Create payment on anchor date
        - For 'day-wise' billing: Create payment based on frequency
        - Prevent duplicate payments using idempotency check
        - Handle timezone conversions properly
        
        Returns: {"created": int, "skipped": int, "errors": list}
        """
        try:
            result = {"created": 0, "skipped": 0, "errors": []}
            payments_collection = getCollection("payments")
            today = datetime.now(timezone.utc).date()
            
            # Find all active tenants with autoGeneratePayments enabled
            tenants = await self.collection.find({
                "autoGeneratePayments": True,
                "billingConfig": {"$exists": True},
                "billingConfig.billingCycle": {"$in": ["monthly", "day-wise"]}
            }).to_list(None)
            
            for tenant_doc in tenants:
                try:
                    tenant_id = str(tenant_doc["_id"])
                    billing_config = tenant_doc.get("billingConfig", {})
                    
                    if not billing_config or not billing_config.get("anchorDate"):
                        result["skipped"] += 1
                        continue
                    
                    # Parse anchor date
                    anchor_date_str = billing_config["anchorDate"]
                    anchor_date = datetime.fromisoformat(anchor_date_str).date()
                    
                    # Check if tenant has already checked out
                    checkout_date_str = tenant_doc.get("checkoutDate")
                    if checkout_date_str:
                        checkout_date = datetime.fromisoformat(checkout_date_str).date()
                        if today > checkout_date:
                            # Tenant has checked out, skip payment generation
                            result["skipped"] += 1
                            continue
                    
                    # Determine due date based on billing cycle
                    due_date = None
                    
                    if billing_config.get("billingCycle") == "monthly":
                        # For monthly: due date is anchor day of this month
                        try:
                            due_date = today.replace(day=anchor_date.day)
                            # If anchor day has passed this month, next month's due date
                            if due_date < today:
                                due_date = (due_date + relativedelta(months=1))
                        except ValueError:
                            # Handle case where anchor day doesn't exist (e.g., 31 in Feb)
                            due_date = today.replace(day=1) + relativedelta(months=1, days=-1)
                    
                    elif billing_config.get("billingCycle") == "day-wise":
                        # For day-wise: due date is anchor date (one-time or recurring every N days)
                        # For now, we'll treat it as simple: if today >= anchor date, generate
                        due_date = anchor_date if anchor_date <= today else None
                    
                    if not due_date:
                        result["skipped"] += 1
                        continue
                    
                    # Idempotency check: Don't create duplicate payments for the same month
                    # Check if payment already exists for this tenant in this month
                    month_start = today.replace(day=1)
                    month_end = month_start + relativedelta(months=1) - relativedelta(days=1)
                    
                    existing_payment = await payments_collection.find_one({
                        "tenantId": tenant_id,
                        "dueDate": {"$gte": month_start.isoformat(), "$lte": month_end.isoformat()}
                    })
                    
                    if existing_payment:
                        result["skipped"] += 1
                        continue
                    
                    # Create payment
                    payment_data = {
                        "tenantId": tenant_id,
                        "propertyId": tenant_doc.get("propertyId"),
                        "bed": tenant_doc.get("bedId", ""),
                        "amount": float(tenant_doc.get("rent", 0)),
                        "status": billing_config.get("status", "due"),
                        "dueDate": due_date.isoformat(),
                        "method": billing_config.get("method", "razorpay"),
                        "createdAt": datetime.now(timezone.utc).isoformat(),
                        "updatedAt": datetime.now(timezone.utc).isoformat(),
                        "notes": f"Auto-generated payment for {due_date.strftime('%B %Y')}"
                    }
                    
                    await payments_collection.insert_one(payment_data)
                    result["created"] += 1
                    
                except Exception as e:
                    result["errors"].append({
                        "tenantId": str(tenant_doc.get("_id", "unknown")),
                        "error": str(e)
                    })
            
            return result
            
        except Exception as e:
            return {
                "created": 0,
                "skipped": 0,
                "errors": [{"job": "generate_monthly_payments", "error": str(e)}]
            }
