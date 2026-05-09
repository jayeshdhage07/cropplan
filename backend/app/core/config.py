"""
Application configuration management.
Loads settings from environment variables and .env file.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_TITLE: str = "Agriculture Crop Prediction Platform"
    APP_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = "postgresql+pg8000://postgres:postgres@localhost:5432/crop_predict_db"

    # API Configuration
    API_V1_STR: str = "/api/v1"

    # JWT Authentication
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_REFRESH_SECRET_KEY: str = "dev-refresh-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:4200,http://localhost:3000"

    # Logging
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
