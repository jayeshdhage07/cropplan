"""
Security and logging middleware for FastAPI.
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and their processing time."""
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"
        
        # Log request details
        logger.info(
            f"{request.client.host} - \"{request.method} {request.url.path}\" "
            f"{response.status_code} - {formatted_process_time}"
        )
        
        # Add custom headers
        response.headers["X-Process-Time"] = formatted_process_time
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Placeholder middleware for API rate limiting.
    In a real production environment, this should be backed by Redis.
    """
    async def dispatch(self, request: Request, call_next):
        # Implementation placeholder:
        # client_ip = request.client.host
        # if is_rate_limited(client_ip):
        #     return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
        
        response = await call_next(request)
        return response
