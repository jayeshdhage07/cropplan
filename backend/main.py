"""
Agriculture Crop Prediction Platform - FastAPI Application Entry Point.

This is the main application file that:
- Initializes the FastAPI application
- Configures CORS middleware
- Registers all API routers
- Sets up exception handlers
- Configures Swagger/OpenAPI documentation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.middleware.security import RequestLoggingMiddleware, RateLimitMiddleware
from app.core.logging import logger
from app.api.auth import router as auth_router
from app.api.crops import router as crops_router
from app.api.mandi import router as mandi_router
from app.api.predictions import router as predictions_router


def create_app() -> FastAPI:
    """
    Application factory function.
    Creates and configures the FastAPI application instance.
    """
    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=(
            "A platform that helps farmers make data-driven decisions about "
            "crop selection, market prices, and profit estimation. "
            "Provides historical mandi price analysis, trend visualization, "
            "and AI-powered crop recommendations."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register exception handlers
    register_exception_handlers(app)

    # Security and Logging Middleware
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # Register API routers
    app.include_router(auth_router)
    
    # We apply the API_V1_STR prefix to other routers if they don't have it
    app.include_router(crops_router, prefix=settings.API_V1_STR)
    app.include_router(mandi_router, prefix=settings.API_V1_STR)
    app.include_router(predictions_router, prefix=settings.API_V1_STR)

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    def health_check():
        """Health check endpoint for load balancers and monitoring."""
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        }

    @app.on_event("startup")
    async def startup_event():
        logger.info(
            f"🚀 {settings.APP_TITLE} v{settings.APP_VERSION} starting up "
            f"({settings.APP_ENV} mode)"
        )

    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Application shutting down...")

    return app


# Create the application instance
app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.is_development,
    )
