"""
Prediction API routes.
Handles crop price predictions, recommendations, and profit estimation.
"""

from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import (
    PredictionResponse,
    CropRecommendation,
    ProfitEstimate,
    ProfitResponse,
)
from app.services.prediction_service import PredictionService
from app.core.security import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions"])

# Service instance
prediction_service = PredictionService()


@router.get("", response_model=PredictionResponse)
def get_prediction(
    crop: str = Query(..., description="Crop name (e.g., onion)"),
    district: str = Query(..., description="District name (e.g., nagpur)"),
    db: Session = Depends(get_db),
):
    """
    Get price prediction for a specific crop and district.
    
    Example: /api/predictions?crop=onion&district=nagpur
    
    Response includes predicted price, trend direction (UP/DOWN/STABLE),
    confidence score, and recommendation text.
    """
    return prediction_service.get_prediction(db, crop, district)


@router.get("/recommendations", response_model=list[CropRecommendation])
def get_recommendations(
    district: str = Query(..., description="District name"),
    season: Optional[str] = Query(None, description="Season (Kharif, Rabi, Zaid)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get crop recommendations for a district.
    
    Returns a ranked list of crops based on predicted price trends
    and recommendation scores. Requires authentication.
    """
    return prediction_service.get_recommendations(db, district, season)


@router.post("/profit", response_model=ProfitResponse)
def calculate_profit(
    estimate: ProfitEstimate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Calculate estimated profit based on costs and predicted prices.
    
    Provide cost breakdown (seeds, fertilizer, labour, irrigation)
    and get estimated revenue, profit, and margin.
    Requires authentication.
    """
    # Get predicted price for the crop
    prediction = prediction_service.get_prediction(
        db, estimate.crop, current_user.get("district", "Pune")
    )
    return PredictionService.calculate_profit(
        db, estimate, prediction.predicted_price
    )


# Placeholder endpoint for future ML prediction integration
@router.post("/ml-predict", response_model=PredictionResponse, include_in_schema=True)
def ml_predict(
    crop: str = Query(..., description="Crop name"),
    district: str = Query(..., description="District name"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    [PLACEHOLDER] ML-based prediction endpoint.
    
    This endpoint will be implemented in Phase 2 when machine learning
    models are integrated. Currently falls back to rule-based prediction.
    """
    return prediction_service.get_prediction(db, crop, district)
