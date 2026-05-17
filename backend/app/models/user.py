"""
User model for authentication and profile management.
Supports farmer and admin roles as defined in the blueprint.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class User(Base):
    """User model representing both farmers and administrators."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    mobile = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(Text, nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True, default="Maharashtra")
    role = Column(String(20), nullable=False, default="farmer")  # farmer | admin
    is_active = Column(String(1), nullable=False, default="1")

    # New farmer-specific fields
    village = Column(String(200), nullable=True)
    preferred_language = Column(String(5), nullable=False, default="en")  # en | hi | mr
    primary_crops = Column(Text, nullable=True)  # Comma-separated crop names
    land_size_acres = Column(Numeric(8, 2), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, role={self.role})>"
