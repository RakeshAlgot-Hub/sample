from dotenv import load_dotenv
load_dotenv() 
from app.database.mongodb import db
from contextlib import asynccontextmanager
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import os
from app.routes import rooms, auth, properties, units, tenants, units_update, dashboard, payments
from app.utils.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Ensure 'static' directory exists
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)


app = FastAPI()

# FastAPI lifespan event handler for startup tasks
@asynccontextmanager
async def lifespan(app):
    # Users: unique email, index on createdAt
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("createdAt")
    # Properties: index on ownerId, createdAt
    await db["properties"].create_index("ownerId")
    await db["properties"].create_index("createdAt")
    # Rooms: index on propertyId, buildingId, createdAt
    await db["rooms"].create_index("propertyId")
    await db["rooms"].create_index("buildingId")
    await db["rooms"].create_index("createdAt")
    # Units: index on propertyId, buildingId, currentTenantId, createdAt
    await db["units"].create_index("propertyId")
    await db["units"].create_index("buildingId")
    await db["units"].create_index("currentTenantId")
    await db["units"].create_index("createdAt")
    # Tenants: index on propertyId, createdAt
    await db["tenants"].create_index("propertyId")
    await db["tenants"].create_index("createdAt")
    yield

app.mount("/static", StaticFiles(directory=static_dir), name="static")
app = FastAPI(lifespan=lifespan)
enforce_https = os.getenv("ENFORCE_HTTPS", "False").lower() == "true"
if enforce_https:
    app.add_middleware(HTTPSRedirectMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again later."}))
app.add_middleware(SlowAPIMiddleware)

# Production-safe CORS setup
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if not allowed_origins_env:
    raise RuntimeError("ALLOWED_ORIGINS environment variable must be set for production-safe CORS.")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
if not allowed_origins:
    raise RuntimeError("ALLOWED_ORIGINS must specify at least one domain.")

# Only allow credentials if needed (e.g., cookies, auth headers)
allow_credentials = os.getenv("ALLOW_CREDENTIALS", "False").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(rooms.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(units_update.router)
app.include_router(dashboard.router)
app.include_router(payments.router)

@app.get("/")
async def root():
    return {"message": "Backend is running"}

@app.get("/health")
async def healthCheck():
    return {"status": "ok"}

# Global error handler (optional but recommended)
@app.exception_handler(Exception)
async def globalExceptionHandler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )