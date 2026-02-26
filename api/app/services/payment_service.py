from typing import List, Optional
from datetime import datetime, timezone
from uuid import uuid4
from ..models.payment_schema import Payment, PaymentCreate

# In-memory storage for demonstration (replace with DB integration)
payments_db: List[Payment] = []

def get_payments() -> List[Payment]:
    return payments_db

def get_payment_by_id(payment_id: str) -> Optional[Payment]:
    for payment in payments_db:
        if payment.id == payment_id:
            return payment
    return None

def create_payment(payment_data: PaymentCreate) -> Payment:
    now = datetime.now(timezone.utc)
    payment = Payment(
        id=str(uuid4()),
        createdAt=now,
        updatedAt=now,
        **payment_data.model_dump()
    )
    payments_db.append(payment)
    return payment

def get_payment_stats():
    collected = sum(
        float(p.amount.replace('₹', '').replace(',', ''))
        for p in payments_db if p.status == 'paid'
    )
    pending = sum(
        float(p.amount.replace('₹', '').replace(',', ''))
        for p in payments_db if p.status == 'due'
    )
    overdue = sum(
        float(p.amount.replace('₹', '').replace(',', ''))
        for p in payments_db if p.status == 'overdue'
    )
    return {
        'collected': f'₹{collected:,.0f}',
        'pending': f'₹{pending:,.0f}',
        'overdue': f'₹{overdue:,.0f}',
    }
