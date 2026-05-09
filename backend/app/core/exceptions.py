"""
Global exception handlers for the FastAPI application.
Provides consistent error response formatting.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.logging import logger


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers with the FastAPI app."""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions with consistent format."""
        logger.warning(
            f"HTTP {exc.status_code}: {exc.detail} | Path: {request.url.path}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.status_code,
                    "message": exc.detail,
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        """Handle request validation errors."""
        logger.warning(f"Validation error: {exc.errors()} | Path: {request.url.path}")
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": 422,
                    "message": "Validation error",
                    "details": exc.errors(),
                },
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """Handle database errors gracefully."""
        logger.error(f"Database error: {str(exc)} | Path: {request.url.path}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": 500,
                    "message": "A database error occurred. Please try again later.",
                },
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Catch-all handler for unhandled exceptions."""
        logger.error(
            f"Unhandled exception: {type(exc).__name__}: {str(exc)} | Path: {request.url.path}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": 500,
                    "message": "An unexpected error occurred. Please try again later.",
                },
            },
        )
