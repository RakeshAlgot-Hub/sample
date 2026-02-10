# api/main.py
from fastapi import FastAPI
from routes.authRoutes import router as authRouter
from routes.propertyRoutes import router as hostelRouter
from routes.buildingRoutes import router as buildingRouter
from routes.floorRoutes import router as floorRouter
from routes.roomRoutes import router as roomRouter
from routes.bedRoutes import router as bedRouter
from routes.memberRoutes import router as memberRouter
from core.dependencies import JwtAuthMiddleware
from core.logger import setupLogger

from core.rateLimiter import limiter
from slowapi.middleware import SlowAPIMiddleware

setupLogger()


from fastapi.middleware.cors import CORSMiddleware

# ... (existing imports)

app = FastAPI(title="Hostel API", version="1.0.0")

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.add_middleware(JwtAuthMiddleware)
app.include_router(authRouter)
app.include_router(hostelRouter)  # Assuming hostelRouter is propertyRouter
app.include_router(buildingRouter)
app.include_router(floorRouter)
app.include_router(roomRouter)
app.include_router(bedRouter)
app.include_router(memberRouter)

app.include_router(buildingRouter)
app.include_router(floorRouter)
app.include_router(roomRouter)
app.include_router(bedRouter)
app.include_router(memberRouter)


@app.get("/")
async def api():
    return "API is running successfully."


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
