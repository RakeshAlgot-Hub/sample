from fastapi import APIRouter, status, HTTPException
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/payments", status_code=status.HTTP_200_OK)
async def get_payments(propertyId: str):
    tenants_collection = db["tenants"]
    units_collection = db["units"]
    tenants_cursor = tenants_collection.find({"propertyId": propertyId})
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
    # Join tenants and units for payment info
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
            "status": None,  # To be set by frontend
            "paidDate": None # To be set by frontend
        })
    return payments

@router.get("/payments/paid", status_code=status.HTTP_200_OK)
async def get_paid_payments(propertyId: str):
    # The frontend determines paid status, so just return all payments
    return await get_payments(propertyId)

@router.get("/payments/due", status_code=status.HTTP_200_OK)
async def get_due_payments(propertyId: str):
    # The frontend determines due status, so just return all payments
    return await get_payments(propertyId)

@router.get("/payments/upcoming", status_code=status.HTTP_200_OK)
async def get_upcoming_payments(propertyId: str):
    # The frontend determines upcoming status, so just return all payments
    return await get_payments(propertyId)
