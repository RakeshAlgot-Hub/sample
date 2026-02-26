from fastapi import APIRouter, HTTPException
from typing import List
from ..models.payment_schema import Payment, PaymentCreate
from ..services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("/", response_model=List[Payment])
def list_payments():
    return payment_service.get_payments()

@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: str):
    payment = payment_service.get_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.post("/", response_model=Payment)
def create_payment(payment: PaymentCreate):
    return payment_service.create_payment(payment)

@router.get("/stats", response_model=dict)
def payment_stats():
    return payment_service.get_payment_stats()
