"""
Seed script to populate initial data (crops and sample mandi prices).
Run this after database migration to set up development data.

Usage:
    python scripts/seed_data.py
"""

import sys
import os
import uuid
from datetime import date, timedelta
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.crop import Crop
from app.models.mandi_price import MandiPrice
from app.models.user import User
from app.core.security import hash_password
from app.core.logging import logger


def seed_crops(db):
    """Seed initial crops as specified in the MVP (Onion, Tomato, Wheat)."""
    crops_data = [
        {
            "name": "Onion",
            "season": "Kharif",
            "average_growth_days": 120,
            "description": "Widely grown across Maharashtra. Major export commodity.",
        },
        {
            "name": "Tomato",
            "season": "Kharif",
            "average_growth_days": 90,
            "description": "High-demand vegetable with significant price volatility.",
        },
        {
            "name": "Wheat",
            "season": "Rabi",
            "average_growth_days": 150,
            "description": "Major cereal crop grown in Rabi season.",
        },
    ]

    created = 0
    for data in crops_data:
        existing = db.query(Crop).filter(Crop.name == data["name"]).first()
        if not existing:
            crop = Crop(**data)
            db.add(crop)
            created += 1

    db.commit()
    logger.info(f"Seeded {created} crops")
    return db.query(Crop).all()


def seed_sample_prices(db, crops):
    """Generate sample mandi price data for the last 3 years."""
    districts = ["Nashik", "Pune", "Nagpur", "Aurangabad", "Solapur"]
    mandis = {
        "Nashik": ["Pimpalgaon Mandi", "Lasalgaon Mandi"],
        "Pune": ["Market Yard Pune", "Pimpri Chinchwad Mandi"],
        "Nagpur": ["Kalamna Market", "Cotton Market Nagpur"],
        "Aurangabad": ["Aurangabad Mandi", "Jalna Mandi"],
        "Solapur": ["Solapur Market Yard", "Pandharpur Mandi"],
    }

    base_prices = {
        "Onion": {"min": 800, "max": 3500, "modal": 1800},
        "Tomato": {"min": 500, "max": 4000, "modal": 1500},
        "Wheat": {"min": 1800, "max": 2800, "modal": 2200},
    }

    count = 0
    start_date = date.today() - timedelta(days=365 * 3)

    for crop in crops:
        prices = base_prices.get(crop.name, {"min": 1000, "max": 3000, "modal": 2000})
        
        for district in districts:
            mandi_list = mandis.get(district, [f"{district} Mandi"])
            
            current_date = start_date
            while current_date <= date.today():
                for mandi in mandi_list:
                    # Add seasonal variation and random noise
                    month_factor = 1.0
                    if current_date.month in [3, 4, 5]:  # Summer - higher prices
                        month_factor = 1.2
                    elif current_date.month in [9, 10, 11]:  # Post-harvest - lower
                        month_factor = 0.85

                    year_trend = 1.0 + (current_date.year - start_date.year) * 0.05  # 5% annual increase
                    noise = random.uniform(0.85, 1.15)

                    modal = prices["modal"] * month_factor * year_trend * noise
                    min_p = modal * random.uniform(0.7, 0.9)
                    max_p = modal * random.uniform(1.1, 1.3)

                    mandi_price = MandiPrice(
                        crop_id=crop.id,
                        state="Maharashtra",
                        district=district,
                        mandi_name=mandi,
                        arrival_date=current_date,
                        min_price=round(min_p, 2),
                        max_price=round(max_p, 2),
                        modal_price=round(modal, 2),
                    )
                    db.add(mandi_price)
                    count += 1

                # Skip to next week (not every day to keep data manageable)
                current_date += timedelta(days=7)

            if count % 1000 == 0:
                db.commit()

    db.commit()
    logger.info(f"Seeded {count} sample mandi price records")


def seed_admin_user(db):
    """Create a default admin user."""
    existing = db.query(User).filter(User.mobile == "9999999999").first()
    if not existing:
        admin = User(
            name="Admin User",
            mobile="9999999999",
            email="admin@croppredict.in",
            password_hash=hash_password("admin123"),
            district="Pune",
            state="Maharashtra",
            role="admin",
        )
        db.add(admin)
        db.commit()
        logger.info("Seeded admin user (mobile: 9999999999, password: admin123)")


def main():
    """Run all seed functions."""
    db = SessionLocal()
    try:
        logger.info("🌱 Starting database seeding...")
        seed_admin_user(db)
        crops = seed_crops(db)
        seed_sample_prices(db, crops)
        logger.info("✅ Database seeding complete!")
    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
