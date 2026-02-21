from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

# 5 login attempts per minute per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])

# Dependency for FastAPI endpoints
rate_limit_dep = limiter.limit("5/minute")
