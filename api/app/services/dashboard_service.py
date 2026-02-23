from app.database.mongodb import db
from bson import ObjectId

async def get_dashboard_stats_service(propertyId: str):
    rooms_collection = db["rooms"]
    units_collection = db["units"]
    tenants_collection = db["tenants"]

    total_rooms = await rooms_collection.count_documents({"propertyId": propertyId})
    total_units = await units_collection.count_documents({"propertyId": propertyId})
    occupied_units = await units_collection.count_documents({"propertyId": propertyId, "status": "occupied"})
    available_units = await units_collection.count_documents({"propertyId": propertyId, "status": "available"})
    total_tenants = await tenants_collection.count_documents({"propertyId": propertyId})
    total_revenue = 0
    async for tenant in tenants_collection.find({"propertyId": propertyId}):
        try:
            total_revenue += float(tenant.get("depositAmount", 0))
        except Exception:
            pass
    occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0
    return {
        "totalRooms": total_rooms,
        "totalUnits": total_units,
        "occupiedUnits": occupied_units,
        "availableUnits": available_units,
        "occupancyRate": round(occupancy_rate, 2),
        "totalTenants": total_tenants,
        "totalRevenue": total_revenue,
    }

async def get_property_stats_service(propertyId: str):
    properties_collection = db["properties"]
    units_collection = db["units"]
    prop = await properties_collection.find_one({"_id": ObjectId(propertyId)})
    if not prop:
        return None
    total_units = await units_collection.count_documents({"propertyId": propertyId})
    occupied_units = await units_collection.count_documents({"propertyId": propertyId, "status": "occupied"})
    occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0
    return [{
        "id": propertyId,
        "name": prop.get("name", ""),
        "type": prop.get("type", ""),
        "totalUnits": total_units,
        "occupiedUnits": occupied_units,
        "occupancyRate": round(occupancy_rate, 2),
    }]

async def get_all_tenants_service(propertyId: str):
    tenants_collection = db["tenants"]
    tenants = []
    async for tenant in tenants_collection.find({"propertyId": propertyId}):
        tenant["id"] = str(tenant["_id"])
        tenant.pop("_id", None)
        tenants.append(tenant)
    return tenants
