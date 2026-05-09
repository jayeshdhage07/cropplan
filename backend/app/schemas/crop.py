"""
Pydantic schemas for crop data.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class CropCreate(BaseModel):
    """Schema for creating a new crop."""

    name: str = Field(..., min_length=2, max_length=100)
    season: str = Field(..., description="Kharif, Rabi, or Zaid")
    average_growth_days: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    image_url: Optional[str] = None


class CropResponse(BaseModel):
    """Schema for crop response."""

    id: UUID
    name: str
    season: str
    average_growth_days: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class CropListResponse(BaseModel):
    """Schema for paginated crop list."""

    items: list[CropResponse]
    total: int
