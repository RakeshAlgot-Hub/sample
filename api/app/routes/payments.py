from fastapi import APIRouter, status, HTTPException, Depends
from app.utils.helpers import get_current_user
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime
from typing import Optional
from fastapi import Query

router = APIRouter()




@router.get("/payments", status_code=status.HTTP_200_OK)
async def get_payments(
    propertyId: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_user)
):
    tenants_collection = db["tenants"]
    units_collection = db["units"]
    query = {"propertyId": propertyId}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"fullName": {"$regex": search, "$options": "i"}},
            {"documentId": {"$regex": search, "$options": "i"}},
            {"phoneNumber": {"$regex": search, "$options": "i"}}
        ]
    total = await tenants_collection.count_documents(query)
    tenants_cursor = tenants_collection.find(query).skip((page - 1) * limit).limit(limit)
    tenants = []
    async for tenant in tenants_cursor:
        tenant["id"] = str(tenant["_id"])
        tenant.pop("_id", None)
        tenants.append(tenant)
    units_cursor = units_collection.find({"propertyId": propertyId})
    units = []
    async for unit in units_cursor:
        unit["id"] = str(unit["_id"])
        unit.pop("_id", None)
        units.append(unit)
    payments = []
    for tenant in tenants:
        unit = next((u for u in units if u["id"] == tenant["unitId"]), None)
        check_in_date = datetime.fromisoformat(tenant["checkInDate"])
        due_date = check_in_date.replace(month=check_in_date.month % 12 + 1)
        payments.append({
            "id": tenant["id"],
            "tenantId": tenant["id"],
            "tenantName": tenant["fullName"],
            "unitId": tenant["unitId"],
            "unitName": unit["name"] if unit and "name" in unit else "N/A",
            "amount": float(tenant.get("depositAmount", 0)),
            "dueDate": due_date.date().isoformat(),
            "status": tenant.get("status"),
            "paidDate": None
        })
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "results": payments
    }

@router.get("/payments/paid", status_code=status.HTTP_200_OK)
async def get_paid_payments(propertyId: str, current_user=Depends(get_current_user)):
    # The frontend determines paid status, so just return all payments
    return await get_payments(propertyId, current_user)

@router.get("/payments/due", status_code=status.HTTP_200_OK)
async def get_due_payments(propertyId: str, current_user=Depends(get_current_user)):
    # The frontend determines due status, so just return all payments
    return await get_payments(propertyId, current_user)

@router.get("/payments/upcoming", status_code=status.HTTP_200_OK)
async def get_upcoming_payments(propertyId: str, current_user=Depends(get_current_user)):
    # The frontend determines upcoming status, so just return all payments
    return await get_payments(propertyId, current_user)
