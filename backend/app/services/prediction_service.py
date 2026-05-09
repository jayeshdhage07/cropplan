"""
Prediction service layer.
Coordinates between the prediction engine and database operations.
"""

from typing import List, Optional
from datetime import date

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.prediction.engine import get_prediction_engine
from app.schemas.prediction import (
    PredictionResponse,
    CropRecommendation,
    ProfitEstimate,
    ProfitResponse,
)
from app.core.logging import logger


class PredictionService:
    """Service layer for prediction operations."""

    def __init__(self):
        self.engine = get_prediction_engine()

    def get_prediction(
        self,
        db: Session,
        crop: str,
        district: str,
        target_month: Optional[date] = None,
    ) -> PredictionResponse:
        """
        Get price prediction for a crop in a district.
        
        Args:
            db: Database session.
            crop: Crop name.
            district: District name.
            target_month: Optional target month.
        
        Returns:
            PredictionResponse with prediction results.
        """
        result = self.engine.predict(db, crop, district, target_month)
        return PredictionResponse(**result)

    def get_recommendations(
        self,
        db: Session,
        district: str,
        season: Optional[str] = None,
    ) -> List[CropRecommendation]:
        """
        Get crop recommendations for a district.
        
        Args:
            db: Database session.
            district: District name.
            season: Optional season filter.
        
        Returns:
            List of CropRecommendation sorted by score.
        """
        results = self.engine.recommend_crops(db, district, season)
        return [CropRecommendation(**r) for r in results]

    @staticmethod
    def calculate_profit(
        db: Session,
        estimate: ProfitEstimate,
        predicted_price_per_quintal: float,
    ) -> ProfitResponse:
        """
        Calculate estimated profit based on costs and predicted price.
        
        Assumes average yield of 15 quintals per acre for estimation.
        
        Args:
            db: Database session.
            estimate: Cost breakdown.
            predicted_price_per_quintal: Predicted market price.
        
        Returns:
            ProfitResponse with detailed profit analysis.
        """
        total_cost = (
            estimate.seed_cost
            + estimate.fertilizer_cost
            + estimate.labour_cost
            + estimate.irrigation_cost
        )

        # Estimated yield: varies by crop, using 15 quintals/acre as default
        estimated_yield_per_acre = 15.0
        total_yield = estimated_yield_per_acre * estimate.land_size_acres
        expected_revenue = total_yield * predicted_price_per_quintal

        estimated_profit = expected_revenue - total_cost
        profit_margin = (
            (estimated_profit / expected_revenue * 100) if expected_revenue > 0 else 0
        )

        logger.info(
            f"Profit calculated for {estimate.crop}: "
            f"Cost=₹{total_cost:.0f}, Revenue=₹{expected_revenue:.0f}, "
            f"Profit=₹{estimated_profit:.0f}"
        )

        return ProfitResponse(
            crop=estimate.crop,
            total_cost=round(total_cost, 2),
            expected_revenue=round(expected_revenue, 2),
            estimated_profit=round(estimated_profit, 2),
            profit_margin_percent=round(profit_margin, 1),
            predicted_price_per_quintal=round(predicted_price_per_quintal, 2),
        )
