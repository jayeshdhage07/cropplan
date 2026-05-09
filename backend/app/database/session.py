"""
Database session management and SQLAlchemy engine configuration.
Provides session factory and dependency injection for FastAPI routes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Create SQLAlchemy engine with connection pool settings
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Test connections before use
    echo=settings.is_development,  # Log SQL in development
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.
    Automatically closes the session after the request completes.
    
    Yields:
        SQLAlchemy Session instance.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
