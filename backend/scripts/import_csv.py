"""
Sample CSV data import script.
Imports historical mandi price data from CSV files into PostgreSQL.

Usage:
    python scripts/import_csv.py --file data/csv_imports/sample_mandi_data.csv
"""

import argparse
import sys
import os
import uuid
from datetime import datetime

import pandas as pd
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.crop import Crop
from app.models.mandi_price import MandiPrice
from app.core.logging import logger


def get_or_create_crop(db: Session, crop_name: str, season: str = "Kharif") -> Crop:
    """Get existing crop or create a new one."""
    crop = db.query(Crop).filter(Crop.name.ilike(crop_name)).first()
    if not crop:
        crop = Crop(name=crop_name, season=season)
        db.add(crop)
        db.commit()
        db.refresh(crop)
        logger.info(f"Created crop: {crop_name}")
    return crop


def import_mandi_csv(file_path: str) -> None:
    """
    Import mandi price data from a CSV file.
    
    Expected CSV columns:
    - commodity: Crop name
    - state: State name
    - district: District name
    - market: Mandi name
    - arrival_date: Date (YYYY-MM-DD or DD/MM/YYYY)
    - min_price: Minimum price
    - max_price: Maximum price
    - modal_price: Modal price
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return

    logger.info(f"Reading CSV file: {file_path}")
    df = pd.read_csv(file_path)

    # Normalize column names
    df.columns = df.columns.str.lower().str.strip().str.replace(" ", "_")

    # Map common column name variations
    column_mapping = {
        "commodity": "commodity",
        "crop": "commodity",
        "crop_name": "commodity",
        "market": "mandi_name",
        "mandi": "mandi_name",
        "market_name": "mandi_name",
        "date": "arrival_date",
        "price_date": "arrival_date",
    }
    df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})

    required_columns = ["commodity", "district", "min_price", "max_price", "modal_price"]
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        logger.error(f"Missing required columns: {missing}")
        logger.info(f"Available columns: {list(df.columns)}")
        return

    # Clean data
    logger.info("Cleaning data...")
    df = df.dropna(subset=required_columns)
    df["min_price"] = pd.to_numeric(df["min_price"], errors="coerce")
    df["max_price"] = pd.to_numeric(df["max_price"], errors="coerce")
    df["modal_price"] = pd.to_numeric(df["modal_price"], errors="coerce")
    df = df.dropna(subset=["min_price", "max_price", "modal_price"])

    # Parse dates
    if "arrival_date" in df.columns:
        df["arrival_date"] = pd.to_datetime(df["arrival_date"], dayfirst=True, errors="coerce")
        df = df.dropna(subset=["arrival_date"])
    else:
        df["arrival_date"] = datetime.now()

    # Default values
    if "state" not in df.columns:
        df["state"] = "Maharashtra"
    if "mandi_name" not in df.columns:
        df["mandi_name"] = "Unknown"

    logger.info(f"Importing {len(df)} records...")

    # Import into database
    db = SessionLocal()
    try:
        imported = 0
        crop_cache = {}

        for _, row in df.iterrows():
            crop_name = str(row["commodity"]).strip().title()
            
            if crop_name not in crop_cache:
                crop_cache[crop_name] = get_or_create_crop(db, crop_name)

            mandi_price = MandiPrice(
                crop_id=crop_cache[crop_name].id,
                state=str(row.get("state", "Maharashtra")).strip(),
                district=str(row["district"]).strip().title(),
                mandi_name=str(row.get("mandi_name", "Unknown")).strip(),
                arrival_date=row["arrival_date"],
                min_price=float(row["min_price"]),
                max_price=float(row["max_price"]),
                modal_price=float(row["modal_price"]),
            )
            db.add(mandi_price)
            imported += 1

            # Commit in batches
            if imported % 500 == 0:
                db.commit()
                logger.info(f"  Imported {imported} records...")

        db.commit()
        logger.info(f"✅ Successfully imported {imported} records")

    except Exception as e:
        db.rollback()
        logger.error(f"Import failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import mandi CSV data")
    parser.add_argument(
        "--file",
        type=str,
        default="data/csv_imports/sample_mandi_data.csv",
        help="Path to CSV file",
    )
    args = parser.parse_args()
    import_mandi_csv(args.file)
