"""
Mandi data API routes.
Handles historical price data and trend analysis.
"""

from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.mandi import MandiPriceListResponse, MandiPriceResponse, MandiTrendResponse
from app.services.mandi_service import MandiService

router = APIRouter(prefix="/mandi", tags=["Mandi Prices"])


@router.get("/prices", response_model=MandiPriceListResponse)
def get_prices(
    crop: Optional[str] = Query(None, description="Crop name (e.g., onion)"),
    district: Optional[str] = Query(None, description="District name (e.g., pune)"),
    state: str = Query("Maharashtra", description="State name"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
):
    """
    Get historical mandi prices with filtering and pagination.
    
    Example: /api/mandi/prices?crop=onion&district=pune
    """
    skip = (page - 1) * page_size
    prices, total = MandiService.get_prices(
        db,
        crop_name=crop,
        district=district,
        state=state,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=page_size,
    )
    return MandiPriceListResponse(
        items=[MandiPriceResponse.model_validate(p) for p in prices],
        total=total,
    )


@router.get("/trends", response_model=list[MandiTrendResponse])
def get_trends(
    crop: str = Query(..., description="Crop name (required)"),
    district: Optional[str] = Query(None, description="District filter"),
    years: int = Query(3, ge=1, le=10, description="Years of data"),
    db: Session = Depends(get_db),
):
    """
    Get monthly average price trends for a crop.
    
    Example: /api/mandi/trends?crop=onion
    """
    return MandiService.get_trends(db, crop_name=crop, district=district, years=years)


@router.get("/districts", response_model=list[str])
def get_districts(db: Session = Depends(get_db)):
    """Get list of all districts with available mandi data."""
    return MandiService.get_districts(db)
