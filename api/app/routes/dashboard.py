from fastapi import APIRouter, Request, HTTPException
from app.database.mongodb import getCollection

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(request: Request, property_id: str):
    """Get aggregated dashboard statistics for a specific property"""
    property_ids = getattr(request.state, "property_ids", [])
    
    # Validate that the requested property_id belongs to the user
    if property_id not in property_ids:
        raise HTTPException(status_code=403, detail="You don't have access to this property")
    
    # Get collections
    tenants_col = getCollection("tenants")
    beds_col = getCollection("beds")
    
    # Count tenants for this property
    tenants_count = await tenants_col.count_documents({"propertyId": property_id})
    
    # Count beds and occupancy
    total_beds = await beds_col.count_documents({"propertyId": property_id})
    occupied_beds = await beds_col.count_documents({
        "propertyId": property_id,
        "status": "occupied"
    })
    available_beds = await beds_col.count_documents({
        "propertyId": property_id,
        "status": "available"
    })
    
    occupancy_rate = (occupied_beds / total_beds * 100) if total_beds > 0 else 0
    
    return {
        "data": {
            "totalTenants": tenants_count,
            "totalBeds": total_beds,
            "occupiedBeds": occupied_beds,
            "availableBeds": available_beds,
            "occupancyRate": round(occupancy_rate, 2),
        }
    }
