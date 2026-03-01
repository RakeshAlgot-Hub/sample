from fastapi import APIRouter, HTTPException, Body, Request, Query
from typing import List
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
                date_query["$gte"] = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid startDate format. Use ISO 8601.")
        if endDate:
            try:
                date_query["$lte"] = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
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
    for p in payments:
        p["id"] = str(p["_id"])
    
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
    return payment

@router.post("", response_model=Payment)
async def create_payment(request: Request, payment: PaymentCreate):
    property_ids = getattr(request.state, "property_ids", [])
    if payment.propertyId not in property_ids:
        raise HTTPException(status_code=403, detail="Forbidden")
    return await payment_service.create_payment(payment)

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
