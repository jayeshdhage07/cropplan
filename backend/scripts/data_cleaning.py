"""
Data cleaning utilities for raw CSV/dataset processing.
Handles common data quality issues from AGMARKNET and other sources.
"""

import pandas as pd
import numpy as np
from typing import Optional

from app.core.logging import logger


def clean_mandi_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw mandi price data.
    
    Handles:
    - Missing values
    - Negative prices
    - Duplicate records
    - Date formatting
    - String normalization
    """
    original_count = len(df)
    logger.info(f"Cleaning {original_count} records...")

    # Remove completely empty rows
    df = df.dropna(how="all")

    # Normalize string columns
    string_columns = df.select_dtypes(include=["object"]).columns
    for col in string_columns:
        df[col] = df[col].str.strip().str.title()

    # Remove rows with negative prices
    price_columns = ["min_price", "max_price", "modal_price"]
    for col in price_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df = df[df[col] >= 0]

    # Ensure min <= modal <= max
    if all(col in df.columns for col in price_columns):
        # Fix swapped min/max
        mask = df["min_price"] > df["max_price"]
        df.loc[mask, ["min_price", "max_price"]] = df.loc[
            mask, ["max_price", "min_price"]
        ].values

        # Ensure modal is between min and max
        df["modal_price"] = df["modal_price"].clip(
            lower=df["min_price"], upper=df["max_price"]
        )

    # Remove duplicates
    df = df.drop_duplicates()

    cleaned_count = len(df)
    removed = original_count - cleaned_count
    logger.info(
        f"Cleaning complete: {cleaned_count} records retained, "
        f"{removed} records removed ({removed/original_count*100:.1f}%)"
    )

    return df


def fill_missing_prices(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing prices using interpolation.
    Uses forward fill then backward fill for remaining gaps.
    """
    price_columns = ["min_price", "max_price", "modal_price"]
    for col in price_columns:
        if col in df.columns:
            df[col] = df[col].interpolate(method="linear")
            df[col] = df[col].ffill().bfill()
    return df


def calculate_monthly_averages(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate monthly average prices from daily data.
    
    Returns DataFrame with columns:
    - year, month, commodity, district
    - avg_min_price, avg_max_price, avg_modal_price
    - record_count
    """
    if "arrival_date" in df.columns:
        df["arrival_date"] = pd.to_datetime(df["arrival_date"])
        df["year"] = df["arrival_date"].dt.year
        df["month"] = df["arrival_date"].dt.month

    group_cols = ["year", "month"]
    if "commodity" in df.columns:
        group_cols.append("commodity")
    if "district" in df.columns:
        group_cols.append("district")

    monthly = (
        df.groupby(group_cols)
        .agg(
            avg_min_price=("min_price", "mean"),
            avg_max_price=("max_price", "mean"),
            avg_modal_price=("modal_price", "mean"),
            record_count=("modal_price", "count"),
        )
        .reset_index()
    )

    # Round prices
    for col in ["avg_min_price", "avg_max_price", "avg_modal_price"]:
        monthly[col] = monthly[col].round(2)

    return monthly
