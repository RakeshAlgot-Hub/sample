from pydantic import BaseModel
from typing import Optional

class PaymentCreate(BaseModel):
    memberId: str
    amount: float
    paymentDate: Optional[str] = None  # ISO format, optional for auto-set
    method: Optional[str] = None
    note: Optional[str] = None

class PaymentOut(PaymentCreate):
    id: str
    paymentDate: str
