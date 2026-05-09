"""
Crop service handling CRUD operations for crops.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.crop import Crop
from app.schemas.crop import CropCreate
from app.core.logging import logger


class CropService:
    """Service layer for crop operations."""

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 50) -> tuple[List[Crop], int]:
        """
        Get all crops with pagination.
        
        Args:
            db: Database session.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
        
        Returns:
            Tuple of (list of crops, total count).
        """
        total = db.query(Crop).count()
        crops = db.query(Crop).offset(skip).limit(limit).all()
        return crops, total

    @staticmethod
    def get_by_id(db: Session, crop_id: UUID) -> Crop:
        """
        Get a single crop by its ID.
        
        Args:
            db: Database session.
            crop_id: UUID of the crop.
        
        Returns:
            Crop model instance.
        
        Raises:
            HTTPException: If crop is not found.
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with id {crop_id} not found",
            )
        return crop

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Crop]:
        """Get a crop by name (case-insensitive)."""
        return db.query(Crop).filter(Crop.name.ilike(name)).first()

    @staticmethod
    def create(db: Session, crop_data: CropCreate) -> Crop:
        """
        Create a new crop.
        
        Args:
            db: Database session.
            crop_data: Crop creation data.
        
        Returns:
            Created Crop model instance.
        """
        existing = db.query(Crop).filter(Crop.name.ilike(crop_data.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Crop '{crop_data.name}' already exists",
            )

        new_crop = Crop(
            name=crop_data.name,
            season=crop_data.season,
            average_growth_days=crop_data.average_growth_days,
            description=crop_data.description,
            image_url=crop_data.image_url,
        )

        db.add(new_crop)
        db.commit()
        db.refresh(new_crop)

        logger.info(f"Crop created: {new_crop.name}")
        return new_crop
