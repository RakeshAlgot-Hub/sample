from fastapi import APIRouter
from app.database.mongodb import db

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check():
    try:
        await db.command("ping")
        return {"status": "ok"}
    except Exception:
        return {"status": "error"}, 503
