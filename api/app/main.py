from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from app.routes import rooms, auth, properties, units, tenants, units_update, dashboard, payments
from app.utils.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware


app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again later."}))
app.add_middleware(SlowAPIMiddleware)

# Safe CORS setup
allowedOrigins = os.getenv("ALLOWED_ORIGINS")

if allowedOrigins:
    allowedOrigins = allowedOrigins.split(",")
else:
    allowedOrigins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowedOrigins,
    allow_credentials=True,
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