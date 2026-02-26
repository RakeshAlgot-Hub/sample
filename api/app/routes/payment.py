from fastapi import APIRouter
from app.services.payment_service import PaymentService
from app.models.payment_schema import Payment

router = APIRouter(prefix="/payments", tags=["payments"])
payment_service = PaymentService()

@router.get("/")
async def get_payments(property_id: str = None):
    payments = await payment_service.get_payments(property_id)
    return {
        "data": [payment.model_dump() for payment in payments],
        "meta": {
            "total": len(payments),
            "page": 1,
            "pageSize": len(payments),
            "hasMore": False
        }
    }

@router.get("/{payment_id}")
async def get_payment(payment_id: str):
    payment = await payment_service.get_payment(payment_id)
    return {"data": payment.model_dump()} if payment else {"data": {}}

@router.post("/")
async def create_payment(payment: Payment):
    created = await payment_service.create_payment(payment.model_dump())
    return {"data": created.model_dump()}

@router.patch("/{payment_id}")
async def patch_payment(payment_id: str, payment: Payment):
    updated = await payment_service.update_payment(payment_id, payment.model_dump())
    return {"data": updated.model_dump()} if updated else {"data": {}}

@router.delete("/{payment_id}")
async def delete_payment(payment_id: str):
    result = await payment_service.delete_payment(payment_id)
    return {"data": result}
