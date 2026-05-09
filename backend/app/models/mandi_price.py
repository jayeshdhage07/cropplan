"""
Mandi price model for historical market price data from AGMARKNET.
"""

import uuid
from datetime import date

from sqlalchemy import Column, String, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class MandiPrice(Base):
    """Historical mandi price data for crops across districts."""

    __tablename__ = "mandi_prices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(
        UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False, index=True
    )
    state = Column(String(100), nullable=False, default="Maharashtra")
    district = Column(String(100), nullable=False, index=True)
    mandi_name = Column(String(200), nullable=False)
    arrival_date = Column(Date, nullable=False, index=True)
    min_price = Column(Numeric(12, 2), nullable=False)
    max_price = Column(Numeric(12, 2), nullable=False)
    modal_price = Column(Numeric(12, 2), nullable=False)

    # Relationships
    crop = relationship("Crop", back_populates="mandi_prices")

    def __repr__(self):
        return (
            f"<MandiPrice(crop_id={self.crop_id}, district={self.district}, "
            f"date={self.arrival_date}, modal={self.modal_price})>"
        )
