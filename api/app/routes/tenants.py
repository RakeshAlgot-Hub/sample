from fastapi import APIRouter, HTTPException, status, Depends
from app.utils.helpers import get_current_user
from app.database.mongodb import db
from datetime import datetime
from bson import ObjectId
from typing import Optional
from fastapi import Query
from app.models.tenant_schema import TenantRequest, TenantResponse, PaginatedTenantResponse, TenantUpdate
from app.services.unit_service import update_unit_status_and_tenant
router = APIRouter()

@router.post("/tenants", status_code=status.HTTP_201_CREATED, response_model=TenantResponse)
async def create_tenant_endpoint(tenant: TenantRequest, current_user=Depends(get_current_user)):
    # Ownership check
    properties_collection = db["properties"]
    try:
        property_id = ObjectId(tenant.propertyId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid propertyId format")
    property = await properties_collection.find_one({"_id": property_id})
    if not property or property.get("ownerId") != current_user:
        raise HTTPException(status_code=403, detail="Forbidden: Not your property")

    # Validate checkInDate is ISO date
    from dateutil.parser import parse as parse_date
    try:
        parsed_date = parse_date(tenant.checkInDate)
        checkInDate = parsed_date.isoformat()
    except Exception as e:
        raise HTTPException(status_code=400, detail="checkInDate must be a valid ISO date string")

    # Validate depositAmount is a number
    try:
        deposit = float(tenant.depositAmount)
        depositAmount = str(deposit)
    except Exception as e:
        raise HTTPException(status_code=400, detail="depositAmount must be a valid number")

    tenants_collection = db["tenants"]
    from datetime import timezone
    now = datetime.now(timezone.utc)
    tenant_doc = {
        "propertyId": tenant.propertyId,
        "unitId": tenant.unitId,
        "fullName": tenant.fullName,
        "documentId": tenant.documentId,
        "phoneNumber": tenant.phoneNumber,
        "checkInDate": checkInDate,
        "depositAmount": depositAmount,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
        "profilePictureUrl": tenant.profilePictureUrl,
        "address": tenant.address if tenant.address is not None else "",
    }
    result = await tenants_collection.insert_one(tenant_doc)
    tenant_doc["id"] = str(result.inserted_id)
    tenant_doc.pop("_id", None)

    # Update unit status and currentTenantId in backend after tenant creation
    await update_unit_status_and_tenant(tenant.unitId, tenant_doc["id"])

    return TenantResponse(**tenant_doc)





@router.get("/tenants", status_code=status.HTTP_200_OK, response_model=PaginatedTenantResponse)
async def get_tenants(
    propertyId: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_user)
):
    # Ownership check
    properties_collection = db["properties"]
    
    try:
        property_id = ObjectId(propertyId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid propertyId format")
    property = await properties_collection.find_one({"_id": property_id})
    if not property or property.get("ownerId") != current_user:
        raise HTTPException(status_code=403, detail="Forbidden: Not your property")
    tenants_collection = db["tenants"]
    query = {"propertyId": propertyId}
    # status filter removed from tenants
    if search:
        query["$or"] = [
            {"fullName": {"$regex": search, "$options": "i"}},
            {"documentId": {"$regex": search, "$options": "i"}},
            {"phoneNumber": {"$regex": search, "$options": "i"}}
        ]
    total = await tenants_collection.count_documents(query)
    cursor = tenants_collection.find(query).skip((page - 1) * limit).limit(limit)
    tenants = []
    async for tenant in cursor:
        tenant["id"] = str(tenant["_id"])
        tenant.pop("_id", None)
        if "profilePictureUrl" not in tenant:
            tenant["profilePictureUrl"] = None
        if "address" not in tenant:
            tenant["address"] = None
        # Ensure createdAt and updatedAt are ISO strings
        if isinstance(tenant.get("createdAt"), datetime):
            tenant["createdAt"] = tenant["createdAt"].isoformat()
        if isinstance(tenant.get("updatedAt"), datetime):
            tenant["updatedAt"] = tenant["updatedAt"].isoformat()
        tenants.append(TenantResponse(**tenant))
    return PaginatedTenantResponse(total=total, page=page, limit=limit, data=tenants)


@router.delete("/tenants/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(tenant_id: str, current_user=Depends(get_current_user)):
    tenants_collection = db["tenants"]
    tenant = await tenants_collection.find_one({"_id": ObjectId(tenant_id)})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    # Ownership check
    properties_collection = db["properties"]
    
    try:
        property_id = ObjectId(tenant["propertyId"])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid propertyId format")
    property = await properties_collection.find_one({"_id": property_id})
    if not property or property.get("ownerId") != current_user:
        raise HTTPException(status_code=403, detail="Forbidden: Not your property")
    result = await tenants_collection.delete_one({"_id": ObjectId(tenant_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    # Mark the unit as available
    units_collection = db["units"]
    unit_id = tenant.get("unitId")
    if unit_id:
        await units_collection.update_one(
            {"_id": ObjectId(unit_id)},
            {"$set": {"status": "available", "currentTenantId": None}}
        )
    return

@router.patch("/tenants/{tenant_id}", status_code=status.HTTP_200_OK, response_model=TenantResponse)
async def update_tenant(tenant_id: str, data: TenantUpdate, current_user=Depends(get_current_user)):
    tenants_collection = db["tenants"]
    tenant = await tenants_collection.find_one({"_id": ObjectId(tenant_id)})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    # Ownership check removed to allow all authenticated users to update tenants
    update_fields = data.dict(exclude_unset=True)
    from datetime import timezone
    update_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await tenants_collection.update_one({"_id": ObjectId(tenant_id)}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    updated = await tenants_collection.find_one({"_id": ObjectId(tenant_id)})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return TenantResponse(**updated)
