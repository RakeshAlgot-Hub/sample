from fastapi import APIRouter, HTTPException, Body, Request, Query
from typing import List
from datetime import datetime, date
from bson import ObjectId
from ..models.payment_schema import Payment, PaymentCreate,PaymentUpdate

from ..services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])
payment_service = PaymentService()

@router.patch("/{payment_id}", response_model=Payment)
async def update_payment(request: Request, payment_id: str, payment_update: PaymentUpdate = Body(...)):
    updated_payment = await payment_service.update_payment(payment_id, payment_update)
    property_ids = getattr(request.state, "property_ids", [])
    if not updated_payment or updated_payment.propertyId not in property_ids:
        raise HTTPException(status_code=404, detail="Payment not found or forbidden")
    return updated_payment

@router.delete("/{payment_id}")
async def delete_payment(request: Request, payment_id: str):
    # First check if payment exists and user has access
    payment = await payment_service.get_payment_by_id(payment_id)
    property_ids = getattr(request.state, "property_ids", [])
    if not payment or payment.propertyId not in property_ids:
        raise HTTPException(status_code=404, detail="Payment not found or forbidden")
    
    # Delete the payment
    success = await payment_service.delete_payment(payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"success": True, "paymentId": payment_id}

@router.get("", response_model=dict)
async def list_payments(
    request: Request,
    propertyId: str = None,
    tenantId: str = None,
    status: str = Query(default=None, pattern="^(paid|due|overdue)$"),
    page: int = 1,
    page_size: int = 50,
    startDate: str = None,
    endDate: str = None,
):
    from datetime import datetime
    
    property_ids = getattr(request.state, "property_ids", [])
    query = {"propertyId": {"$in": property_ids}} if property_ids else {}
    
    # Filter by specific property if provided
    if propertyId:
        if propertyId in property_ids:
            query = {"propertyId": propertyId}
        else:
            raise HTTPException(status_code=403, detail="Forbidden")

    if tenantId:
        query["tenantId"] = tenantId

    if status:
        query["status"] = status

    # Date range filtering (filter by dueDate field)
    if startDate or endDate:
        date_query = {}
        if startDate:
            try:
                # Convert ISO string to date, then to ISO format string for MongoDB
                start_datetime = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
                date_query["$gte"] = start_datetime.date().isoformat()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid startDate format. Use ISO 8601.")
        if endDate:
            try:
                # Convert ISO string to date, then to ISO format string for MongoDB
                end_datetime = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
                date_query["$lte"] = end_datetime.date().isoformat()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid endDate format. Use ISO 8601.")
        if date_query:
            query["dueDate"] = date_query

    page = max(1, page)
    page_size = min(max(1, page_size), 200)
    skip = (page - 1) * page_size
    
    total = await payment_service.collection.count_documents(query)
    cursor = payment_service.collection.find(query).sort("updatedAt", -1).skip(skip).limit(page_size)
    payments = await cursor.to_list(length=page_size)
    
    # Enrich payments with tenant names and room numbers
    tenant_ids = list(set(p.get("tenantId") for p in payments if p.get("tenantId")))
    bed_ids = list(set(p.get("bed") for p in payments if p.get("bed")))
    
    # Get tenant names
    valid_tenant_ids = []
    for tid in tenant_ids:
        try:
            valid_tenant_ids.append(ObjectId(tid))
        except Exception:
            # Skip invalid ObjectIds
            pass
    
    tenants_cursor = await payment_service.get_tenants_collection().find(
        {"_id": {"$in": valid_tenant_ids}},
        {"_id": 1, "name": 1}
    ).to_list(None)
    tenant_map = {str(t["_id"]): t.get("name", "Unknown") for t in tenants_cursor}
    
    # Get room numbers via bed lookup
    valid_bed_ids = []
    for bid in bed_ids:
        if bid:
            try:
                valid_bed_ids.append(ObjectId(bid))
            except Exception:
                # Skip invalid ObjectIds (e.g., UUIDs or non-MongoDB IDs)
                pass
    
    beds_cursor = await payment_service.get_beds_collection().find(
        {"_id": {"$in": valid_bed_ids}},
        {"_id": 1, "roomId": 1}
    ).to_list(None)
    bed_to_room = {str(b["_id"]): b.get("roomId") for b in beds_cursor}
    
    # Get room numbers
    room_ids = list(set(rid for rid in bed_to_room.values() if rid))
    valid_room_ids = []
    for rid in room_ids:
        try:
            valid_room_ids.append(ObjectId(rid))
        except Exception:
            # Skip invalid ObjectIds
            pass
    
    rooms_cursor = await payment_service.get_rooms_collection().find(
        {"_id": {"$in": valid_room_ids}},
        {"_id": 1, "roomNumber": 1}
    ).to_list(None)
    room_map = {str(r["_id"]): r.get("roomNumber", "N/A") for r in rooms_cursor}
    
    # Enrich payments
    for p in payments:
        p["id"] = str(p["_id"])
        p["tenantName"] = tenant_map.get(p.get("tenantId"), "Unknown")
        room_id = bed_to_room.get(p.get("bed"))
        p["roomNumber"] = room_map.get(room_id, "N/A") if room_id else "N/A"
    
    return {
        "data": [Payment(**p) for p in payments],
        "meta": {
            "total": total,
            "page": page,
            "pageSize": page_size,
            "hasMore": (skip + len(payments)) < total
        }
    }

@router.get("/{payment_id}", response_model=Payment)
async def get_payment(request: Request, payment_id: str):
    payment = await payment_service.get_payment_by_id(payment_id)
    property_ids = getattr(request.state, "property_ids", [])
    if not payment or payment.propertyId not in property_ids:
        raise HTTPException(status_code=404, detail="Payment not found or forbidden")
    
    payment_dict = payment.model_dump()
    
    # Enrich with tenant name
    if payment.tenantId:
        try:
            tenant_doc = await payment_service.get_tenants_collection().find_one(
                {"_id": ObjectId(payment.tenantId)},
                {"name": 1}
            )
            if tenant_doc:
                payment_dict["tenantName"] = tenant_doc.get("name", "Unknown")
        except Exception:
            # Skip if tenant ID is invalid
            pass
    
    # Enrich with room number
    if payment.bed:
        try:
            bed_doc = await payment_service.get_beds_collection().find_one(
                {"_id": ObjectId(payment.bed)},
                {"roomId": 1}
            )
            if bed_doc and bed_doc.get("roomId"):
                room_doc = await payment_service.get_rooms_collection().find_one(
                    {"_id": ObjectId(bed_doc["roomId"])},
                    {"roomNumber": 1}
                )
                if room_doc:
                    payment_dict["roomNumber"] = room_doc.get("roomNumber", "N/A")
        except Exception:
            # Skip if bed ID is invalid (e.g., UUID or non-MongoDB ID)
            pass
    
    return Payment(**payment_dict)

@router.get("/stats", response_model=dict)
async def payment_stats(request: Request):
    # Optionally, stats could be filtered by property_ids if needed
    return await payment_service.get_payment_stats()

@router.post("/admin/generate-monthly", response_model=dict)
async def generate_monthly_payments_manual(request: Request):
    """
    Admin endpoint: Manually trigger monthly payment generation.
    Useful for testing or manual execution outside scheduled time.
    Requires user authentication.
    """
    from app.services.tenant_service import TenantService
    tenant_service = TenantService()
    
    try:
        result = await tenant_service.generate_monthly_payments()
        return {
            "status": "success",
            "message": f"Generated {result['created']} payments, skipped {result['skipped']}",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating payments: {str(e)}")
