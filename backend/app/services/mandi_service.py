"""
Mandi price service for historical price data operations.
"""

from typing import List, Optional
from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from fastapi import HTTPException, status

from app.models.mandi_price import MandiPrice
from app.models.crop import Crop
from app.schemas.mandi import MandiTrendResponse
from app.core.logging import logger


class MandiService:
    """Service layer for mandi price operations."""

    @staticmethod
    def get_prices(
        db: Session,
        crop_name: Optional[str] = None,
        district: Optional[str] = None,
        state: str = "Maharashtra",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[MandiPrice], int]:
        """
        Get historical mandi prices with filtering.
        
        Args:
            db: Database session.
            crop_name: Filter by crop name.
            district: Filter by district.
            state: Filter by state (default: Maharashtra).
            start_date: Filter by start date.
            end_date: Filter by end date.
            skip: Pagination offset.
            limit: Page size.
        
        Returns:
            Tuple of (list of mandi prices, total count).
        """
        query = db.query(MandiPrice)

        # Apply filters
        if crop_name:
            crop = db.query(Crop).filter(Crop.name.ilike(crop_name)).first()
            if crop:
                query = query.filter(MandiPrice.crop_id == crop.id)
            else:
                return [], 0

        if district:
            query = query.filter(MandiPrice.district.ilike(f"%{district}%"))

        if state:
            query = query.filter(MandiPrice.state.ilike(f"%{state}%"))

        if start_date:
            query = query.filter(MandiPrice.arrival_date >= start_date)

        if end_date:
            query = query.filter(MandiPrice.arrival_date <= end_date)

        total = query.count()
        prices = (
            query.order_by(MandiPrice.arrival_date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return prices, total

    @staticmethod
    def get_trends(
        db: Session,
        crop_name: str,
        district: Optional[str] = None,
        years: int = 3,
    ) -> List[MandiTrendResponse]:
        """
        Get monthly average price trends for a crop.
        
        Args:
            db: Database session.
            crop_name: Crop name.
            district: Optional district filter.
            years: Number of years of data to include.
        
        Returns:
            List of monthly trend data.
        """
        crop = db.query(Crop).filter(Crop.name.ilike(crop_name)).first()
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop '{crop_name}' not found",
            )

        query = db.query(
            extract("year", MandiPrice.arrival_date).label("year"),
            extract("month", MandiPrice.arrival_date).label("month"),
            func.avg(MandiPrice.min_price).label("avg_min"),
            func.avg(MandiPrice.max_price).label("avg_max"),
            func.avg(MandiPrice.modal_price).label("avg_modal"),
            func.count(MandiPrice.id).label("count"),
        ).filter(MandiPrice.crop_id == crop.id)

        if district:
            query = query.filter(MandiPrice.district.ilike(f"%{district}%"))

        trends = (
            query.group_by(
                extract("year", MandiPrice.arrival_date),
                extract("month", MandiPrice.arrival_date),
            )
            .order_by(
                extract("year", MandiPrice.arrival_date),
                extract("month", MandiPrice.arrival_date),
            )
            .all()
        )

        month_names = [
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ]

        return [
            MandiTrendResponse(
                month=month_names[int(t.month)],
                year=int(t.year),
                avg_min_price=round(float(t.avg_min), 2),
                avg_max_price=round(float(t.avg_max), 2),
                avg_modal_price=round(float(t.avg_modal), 2),
                record_count=t.count,
            )
            for t in trends
        ]

    @staticmethod
    def get_districts(db: Session) -> List[str]:
        """Get list of distinct districts with mandi data."""
        districts = (
            db.query(MandiPrice.district)
            .distinct()
            .order_by(MandiPrice.district)
            .all()
        )
        return [d[0] for d in districts]
