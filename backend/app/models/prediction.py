"""
Prediction model for storing crop price predictions and recommendations.
"""

import uuid
from datetime import datetime, timezone, date

from sqlalchemy import Column, String, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class Prediction(Base):
    """Crop price prediction and recommendation data."""

    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(
        UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False, index=True
    )
    district = Column(String(100), nullable=False, index=True)
    predicted_price = Column(Numeric(12, 2), nullable=False)
    confidence_score = Column(Numeric(5, 2), nullable=True)  # 0-100
    trend = Column(String(10), nullable=True)  # UP, DOWN, STABLE
    prediction_month = Column(Date, nullable=False)
    method = Column(
        String(50), nullable=False, default="rule_based"
    )  # rule_based | ml_model
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    crop = relationship("Crop", back_populates="predictions")

    def __repr__(self):
        return (
            f"<Prediction(crop_id={self.crop_id}, district={self.district}, "
            f"price={self.predicted_price}, trend={self.trend})>"
        )
