from pydantic import BaseModel
from typing import Optional

class RazorpayOrder(BaseModel):
    order_id: str
    user_id: str
    plan: str
    amount: int
    currency: str
    status: str  # created, paid, failed
    receipt: str
    payment_id: Optional[str] = None
    signature: Optional[str] = None
    created_at: str
    updated_at: str
