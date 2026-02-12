from fastapi import APIRouter, Depends, HTTPException
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.payment_service import get_payments, get_payment, create_payment, update_payment, delete_payment
from app.core.auth import get_current_user
from typing import List

router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("", response_model=List[PaymentOut])
async def list_payments(memberId: str = None, current_user=Depends(get_current_user)):
    return await get_payments(memberId)

@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment_by_id(payment_id: str, current_user=Depends(get_current_user)):
    return await get_payment(payment_id)

@router.post("", response_model=PaymentOut)
async def create_payment_api(data: dict, current_user=Depends(get_current_user)):
    return await create_payment(data)

@router.put("/{payment_id}", response_model=PaymentOut)
async def update_payment_api(payment_id: str, data: dict, current_user=Depends(get_current_user)):
    return await update_payment(payment_id, data)

@router.delete("/{payment_id}")
async def delete_payment_api(payment_id: str, current_user=Depends(get_current_user)):
    return await delete_payment(payment_id)
