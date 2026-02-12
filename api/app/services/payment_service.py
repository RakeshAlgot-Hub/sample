from app.db.mongodb import mongodb
from app.models.payment import PaymentModel
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId

async def get_payments(member_id: str = None):
    query = {"memberId": member_id} if member_id else {}
    cursor = mongodb.db["payments"].find(query)
    return [PaymentModel.from_mongo(doc) async for doc in cursor]

async def get_payment(payment_id: str):
    try:
        obj_id = ObjectId(payment_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid payment ID")
    doc = await mongodb.db["payments"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentModel.from_mongo(doc)

async def create_payment(data: dict):
    if not data.get('paymentDate'):
        data['paymentDate'] = datetime.utcnow().isoformat()
    payment = PaymentModel(**data)
    result = await mongodb.db["payments"].insert_one(payment.to_dict())
    payment.id = str(result.inserted_id)
    return payment

async def update_payment(payment_id: str, data: dict):
    try:
        obj_id = ObjectId(payment_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid payment ID")
    await mongodb.db["payments"].update_one({"_id": obj_id}, {"$set": data})
    return await get_payment(payment_id)

async def delete_payment(payment_id: str):
    try:
        obj_id = ObjectId(payment_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid payment ID")
    await mongodb.db["payments"].delete_one({"_id": obj_id})
    return {"status": "deleted"}
