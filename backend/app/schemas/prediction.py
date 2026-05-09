"""
Pydantic schemas for prediction data.
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date
from decimal import Decimal


class PredictionRequest(BaseModel):
    """Schema for requesting a prediction."""

    crop: str = Field(..., description="Crop name (e.g., onion)")
    district: str = Field(..., description="District name (e.g., Nashik)")
    season: Optional[str] = Field(None, description="Season (Kharif, Rabi, Zaid)")
    land_size_acres: Optional[float] = Field(None, ge=0.1, description="Land size in acres")


class PredictionResponse(BaseModel):
    """Schema for prediction result."""

    crop: str
    district: str
    predicted_price: float
    trend: str  # UP, DOWN, STABLE
    confidence: float  # 0-100
    prediction_month: str
    method: str = "rule_based"
    recommendation: Optional[str] = None


class CropRecommendation(BaseModel):
    """Schema for crop recommendation result."""

    crop_name: str
    predicted_price: float
    trend: str
    confidence: float
    expected_profit_per_acre: Optional[float] = None
    recommendation_score: float  # 0-100
    reason: str


class ProfitEstimate(BaseModel):
    """Schema for profit estimation."""

    crop: str
    seed_cost: float = Field(..., ge=0)
    fertilizer_cost: float = Field(..., ge=0)
    labour_cost: float = Field(..., ge=0)
    irrigation_cost: float = Field(..., ge=0)
    land_size_acres: float = Field(..., ge=0.1)


class ProfitResponse(BaseModel):
    """Schema for profit calculation response."""

    crop: str
    total_cost: float
    expected_revenue: float
    estimated_profit: float
    profit_margin_percent: float
    predicted_price_per_quintal: float
