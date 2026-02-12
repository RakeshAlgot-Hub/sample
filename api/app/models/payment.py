from typing import Optional
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

class PaymentModel(BaseModel):
    id: Optional[str] = None
    memberId: str
    amount: float
    paymentDate: str  # ISO format
    method: Optional[str] = None
    note: Optional[str] = None

    def to_dict(self):
        data = self.dict(exclude_none=True)
        if self.id:
            data['_id'] = ObjectId(self.id)
            del data['id']
        return data

    @staticmethod
    def from_mongo(data):
        return PaymentModel(
            id=str(data.get('_id')),
            memberId=data['memberId'],
            amount=data['amount'],
            paymentDate=data['paymentDate'],
            method=data.get('method'),
            note=data.get('note')
        )
