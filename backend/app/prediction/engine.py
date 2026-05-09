"""
Rule-based prediction engine (Phase 1).
Analyzes historical mandi price trends to predict future prices.
Architecture is extensible for future ML model integration (Phase 2).
"""

from typing import Optional, List
from datetime import date, timedelta
from abc import ABC, abstractmethod

from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.mandi_price import MandiPrice
from app.models.crop import Crop
from app.models.prediction import Prediction
from app.core.logging import logger


class BasePredictionEngine(ABC):
    """
    Abstract base class for prediction engines.
    Extend this class to implement ML-based prediction in Phase 2.
    """

    @abstractmethod
    def predict(
        self,
        db: Session,
        crop_name: str,
        district: str,
        target_month: Optional[date] = None,
    ) -> dict:
        """Generate a price prediction for the given crop and district."""
        pass

    @abstractmethod
    def recommend_crops(
        self,
        db: Session,
        district: str,
        season: Optional[str] = None,
    ) -> list:
        """Recommend best crops for the given district and season."""
        pass


class RuleBasedEngine(BasePredictionEngine):
    """
    Phase 1: Rule-based prediction engine.
    
    Logic:
    - Analyzes last 3 years of same-season price trends
    - If average price is trending up → predict UP
    - If average price is trending down → predict DOWN
    - Otherwise → predict STABLE
    - Confidence is based on data availability and trend consistency
    """

    def predict(
        self,
        db: Session,
        crop_name: str,
        district: str,
        target_month: Optional[date] = None,
    ) -> dict:
        """
        Generate a rule-based price prediction.
        
        Args:
            db: Database session.
            crop_name: Name of the crop.
            district: District name.
            target_month: Target month for prediction (defaults to next month).
        
        Returns:
            Dictionary with prediction results.
        """
        # Find the crop
        crop = db.query(Crop).filter(Crop.name.ilike(crop_name)).first()
        if not crop:
            return {
                "crop": crop_name,
                "district": district,
                "predicted_price": 0,
                "trend": "UNKNOWN",
                "confidence": 0,
                "prediction_month": str(target_month or date.today()),
                "method": "rule_based",
                "recommendation": "Insufficient data. Crop not found in database.",
            }

        # Get yearly average prices for the last 3 years
        yearly_averages = self._get_yearly_averages(db, crop.id, district, years=3)

        if len(yearly_averages) < 2:
            # Not enough data for trend analysis
            latest_price = self._get_latest_avg_price(db, crop.id, district)
            return {
                "crop": crop_name,
                "district": district,
                "predicted_price": round(latest_price, 2) if latest_price else 0,
                "trend": "STABLE",
                "confidence": 30.0,
                "prediction_month": str(target_month or date.today()),
                "method": "rule_based",
                "recommendation": "Limited historical data. Prediction has low confidence.",
            }

        # Analyze trend direction
        trend, confidence, predicted_price = self._analyze_trend(yearly_averages)

        # Generate recommendation
        recommendation = self._generate_recommendation(
            crop_name, trend, confidence, predicted_price
        )

        if not target_month:
            target_month = date.today().replace(day=1) + timedelta(days=32)
            target_month = target_month.replace(day=1)

        result = {
            "crop": crop_name,
            "district": district,
            "predicted_price": round(predicted_price, 2),
            "trend": trend,
            "confidence": round(confidence, 1),
            "prediction_month": str(target_month),
            "method": "rule_based",
            "recommendation": recommendation,
        }

        logger.info(
            f"Prediction generated: {crop_name} in {district} → "
            f"{trend} (₹{predicted_price:.0f}, confidence: {confidence:.0f}%)"
        )

        return result

    def recommend_crops(
        self,
        db: Session,
        district: str,
        season: Optional[str] = None,
    ) -> list:
        """
        Recommend best crops based on trend analysis.
        
        Args:
            db: Database session.
            district: District name.
            season: Optional season filter.
        
        Returns:
            List of crop recommendations sorted by score.
        """
        query = db.query(Crop)
        if season:
            query = query.filter(Crop.season.ilike(season))

        crops = query.all()
        recommendations = []

        for crop in crops:
            prediction = self.predict(db, crop.name, district)
            
            # Calculate recommendation score (0-100)
            score = self._calculate_recommendation_score(
                prediction["trend"], prediction["confidence"], prediction["predicted_price"]
            )

            recommendations.append({
                "crop_name": crop.name,
                "predicted_price": prediction["predicted_price"],
                "trend": prediction["trend"],
                "confidence": prediction["confidence"],
                "recommendation_score": round(score, 1),
                "reason": prediction["recommendation"],
            })

        # Sort by recommendation score (descending)
        recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return recommendations

    def _get_yearly_averages(
        self, db: Session, crop_id, district: str, years: int = 3
    ) -> list:
        """Get yearly average modal prices for the last N years."""
        results = (
            db.query(
                extract("year", MandiPrice.arrival_date).label("year"),
                func.avg(MandiPrice.modal_price).label("avg_price"),
            )
            .filter(
                MandiPrice.crop_id == crop_id,
                MandiPrice.district.ilike(f"%{district}%"),
            )
            .group_by(extract("year", MandiPrice.arrival_date))
            .order_by(extract("year", MandiPrice.arrival_date))
            .all()
        )
        return [(int(r.year), float(r.avg_price)) for r in results]

    def _get_latest_avg_price(
        self, db: Session, crop_id, district: str
    ) -> Optional[float]:
        """Get the latest average price for a crop in a district."""
        result = (
            db.query(func.avg(MandiPrice.modal_price))
            .filter(
                MandiPrice.crop_id == crop_id,
                MandiPrice.district.ilike(f"%{district}%"),
            )
            .scalar()
        )
        return float(result) if result else None

    def _analyze_trend(self, yearly_averages: list) -> tuple:
        """
        Analyze price trend from yearly averages.
        
        Returns:
            Tuple of (trend, confidence, predicted_price).
        """
        prices = [avg for _, avg in yearly_averages]

        # Calculate year-over-year changes
        changes = []
        for i in range(1, len(prices)):
            pct_change = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100
            changes.append(pct_change)

        avg_change = sum(changes) / len(changes) if changes else 0

        # Determine trend
        if avg_change > 5:
            trend = "UP"
        elif avg_change < -5:
            trend = "DOWN"
        else:
            trend = "STABLE"

        # Calculate confidence based on consistency of trend
        if len(changes) >= 2:
            # Check if all changes are in the same direction
            all_positive = all(c > 0 for c in changes)
            all_negative = all(c < 0 for c in changes)
            if all_positive or all_negative:
                confidence = min(85.0, 60.0 + len(changes) * 10)
            else:
                confidence = min(65.0, 40.0 + len(changes) * 5)
        else:
            confidence = 45.0

        # Predict next price using simple extrapolation
        latest_price = prices[-1]
        predicted_price = latest_price * (1 + avg_change / 100)

        return trend, confidence, predicted_price

    def _generate_recommendation(
        self, crop_name: str, trend: str, confidence: float, predicted_price: float
    ) -> str:
        """Generate human-readable recommendation text."""
        if trend == "UP" and confidence >= 60:
            return (
                f"{crop_name} shows a strong upward price trend. "
                f"Expected price: ₹{predicted_price:.0f}/quintal. "
                f"Good time to consider growing this crop."
            )
        elif trend == "UP":
            return (
                f"{crop_name} shows a moderate upward trend. "
                f"Consider growing if other conditions are favorable."
            )
        elif trend == "DOWN" and confidence >= 60:
            return (
                f"{crop_name} prices are trending downward. "
                f"Consider alternative crops to maximize profit."
            )
        elif trend == "DOWN":
            return (
                f"{crop_name} prices show a slight declining trend. "
                f"Monitor market conditions before deciding."
            )
        else:
            return (
                f"{crop_name} prices are relatively stable. "
                f"Expected price: ₹{predicted_price:.0f}/quintal."
            )

    def _calculate_recommendation_score(
        self, trend: str, confidence: float, predicted_price: float
    ) -> float:
        """Calculate a recommendation score (0-100) for crop ranking."""
        base_score = 50.0

        if trend == "UP":
            base_score += 25
        elif trend == "DOWN":
            base_score -= 20

        # Factor in confidence
        confidence_factor = (confidence / 100) * 20
        base_score += confidence_factor

        return min(100.0, max(0.0, base_score))


# Factory function to get the active prediction engine
def get_prediction_engine() -> BasePredictionEngine:
    """
    Factory function returning the active prediction engine.
    Currently returns the rule-based engine.
    Switch to ML engine in Phase 2.
    """
    return RuleBasedEngine()
