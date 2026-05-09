"""
Crop API routes.
Handles CRUD operations for agricultural crops.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.crop import CropCreate, CropResponse, CropListResponse
from app.services.crop_service import CropService
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/crops", tags=["Crops"])


@router.get("", response_model=CropListResponse)
def get_all_crops(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """
    Get all crops with pagination.
    Public endpoint - no authentication required.
    """
    crops, total = CropService.get_all(db, skip=skip, limit=limit)
    return CropListResponse(
        items=[CropResponse.model_validate(c) for c in crops],
        total=total,
    )


@router.get("/{crop_id}", response_model=CropResponse)
def get_crop(crop_id: UUID, db: Session = Depends(get_db)):
    """
    Get a single crop by ID.
    Public endpoint - no authentication required.
    """
    crop = CropService.get_by_id(db, crop_id)
    return CropResponse.model_validate(crop)


@router.post("", response_model=CropResponse, status_code=201)
def create_crop(
    crop_data: CropCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Create a new crop entry.
    Admin-only endpoint.
    """
    crop = CropService.create(db, crop_data)
    return CropResponse.model_validate(crop)
