"""
Application logging configuration.
Sets up structured logging with configurable log levels.
"""

import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """
    Configure and return the application logger.
    
    Returns:
        Configured logger instance.
    """
    logger = logging.getLogger("crop_predict")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

    # Console handler with formatted output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

    # Structured log format
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(formatter)

    # Avoid duplicate handlers on reload
    if not logger.handlers:
        logger.addHandler(console_handler)

    return logger


# Application logger singleton
logger = setup_logging()
