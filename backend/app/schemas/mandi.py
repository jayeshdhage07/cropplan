"""
Pydantic schemas for mandi price data.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date
from decimal import Decimal


class MandiPriceResponse(BaseModel):
    """Schema for individual mandi price record."""

    id: UUID
    crop_id: UUID
    state: str
    district: str
    mandi_name: str
    arrival_date: date
    min_price: Decimal
    max_price: Decimal
    modal_price: Decimal

    class Config:
        from_attributes = True


class MandiPriceListResponse(BaseModel):
    """Schema for paginated mandi price list."""

    items: list[MandiPriceResponse]
    total: int


class MandiTrendResponse(BaseModel):
    """Schema for price trend data (monthly averages)."""

    month: str
    year: int
    avg_min_price: float
    avg_max_price: float
    avg_modal_price: float
    record_count: int


class MandiPriceFilter(BaseModel):
    """Schema for filtering mandi prices."""

    crop: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = "Maharashtra"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
