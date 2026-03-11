from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from app.config.settings import REDIS_URL
import redis

# Redis-backed rate limiting for scalability across multiple instances
try:
    # Use Redis for distributed rate limiting if available
    # redis.from_url is used for simple connection
    limiter = Limiter(
        key_func=get_remote_address, 
        default_limits=["100/minute"],
        storage_uri=REDIS_URL
    )
except Exception:
    # Fallback to in-memory if Redis is unavailable (dev environment)
    limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Login-specific rate limit (stricter to prevent brute force)
login_rate_limit_dep = limiter.limit("5/minute")

# General route-specific limits
rate_limit_dep = limiter.limit("100/minute")
sensitive_action_limit = limiter.limit("10/minute")
