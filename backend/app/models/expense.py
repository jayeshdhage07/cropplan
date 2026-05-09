"""
Expense model for farmer profit calculation.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class Expense(Base):
    """Farmer expense tracking for profit calculation."""

    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    crop_id = Column(
        UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False, index=True
    )
    seed_cost = Column(Numeric(12, 2), nullable=False, default=0)
    fertilizer_cost = Column(Numeric(12, 2), nullable=False, default=0)
    labour_cost = Column(Numeric(12, 2), nullable=False, default=0)
    irrigation_cost = Column(Numeric(12, 2), nullable=False, default=0)
    total_cost = Column(Numeric(12, 2), nullable=False, default=0)
    land_size_acres = Column(Numeric(8, 2), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<Expense(user_id={self.user_id}, crop_id={self.crop_id}, total={self.total_cost})>"
