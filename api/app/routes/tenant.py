from fastapi import APIRouter
from app.services.tenant_service import TenantService
from app.models.tenant_schema import Tenant

router = APIRouter(prefix="/tenants", tags=["tenants"])
tenant_service = TenantService()

@router.get("/")
async def get_tenants(property_id: str = None):
    tenants = await tenant_service.get_tenants(property_id)
    return {
        "data": [tenant.model_dump() for tenant in tenants],
        "meta": {
            "total": len(tenants),
            "page": 1,
            "pageSize": len(tenants),
            "hasMore": False
        }
    }

@router.get("/{tenant_id}")
async def get_tenant(tenant_id: str):
    tenant = await tenant_service.get_tenant(tenant_id)
    return {"data": tenant.model_dump()} if tenant else {"data": {}}

@router.post("/")
async def create_tenant(tenant: Tenant):
    created = await tenant_service.create_tenant(tenant.model_dump())
    return {"data": created.model_dump()}

@router.patch("/{tenant_id}")
async def patch_tenant(tenant_id: str, tenant: Tenant):
    updated = await tenant_service.update_tenant(tenant_id, tenant.model_dump())
    return {"data": updated.model_dump()} if updated else {"data": {}}

@router.delete("/{tenant_id}")
async def delete_tenant(tenant_id: str):
    result = await tenant_service.delete_tenant(tenant_id)
    return {"data": result}
