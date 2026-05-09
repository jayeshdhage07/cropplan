"""
Crop model representing agricultural crops tracked by the platform.
"""

import uuid

from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class Crop(Base):
    """Crop model for agricultural crops (Onion, Tomato, Wheat, etc.)."""

    __tablename__ = "crops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True, index=True)
    season = Column(String(50), nullable=False)  # Kharif, Rabi, Zaid
    average_growth_days = Column(Integer, nullable=True)
    description = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)

    # Relationships
    mandi_prices = relationship("MandiPrice", back_populates="crop", lazy="dynamic")
    predictions = relationship("Prediction", back_populates="crop", lazy="dynamic")

    def __repr__(self):
        return f"<Crop(id={self.id}, name={self.name}, season={self.season})>"
