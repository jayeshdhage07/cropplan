"""
Pydantic schemas for authentication (register, login, token responses).
"""

import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from uuid import UUID


class UserRegister(BaseModel):
    """Schema for user registration with enhanced farmer fields."""

    name: str = Field(..., min_length=2, max_length=255, description="Full name")
    mobile: str = Field(
        ..., min_length=10, max_length=15, description="Mobile number"
    )
    email: Optional[str] = Field(None, description="Email address")
    password: str = Field(..., min_length=8, description="Password (min 8 chars)")
    confirm_password: str = Field(..., description="Confirm password")
    district: Optional[str] = Field(None, description="User's district")
    state: Optional[str] = Field("Maharashtra", description="User's state")
    village: Optional[str] = Field(None, max_length=200, description="User's village")
    preferred_language: Optional[str] = Field("en", description="Preferred language (en/hi/mr)")
    primary_crops: Optional[str] = Field(None, description="Comma-separated primary crops")
    land_size_acres: Optional[float] = Field(None, ge=0.1, description="Land size in acres")

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        """Validate Indian mobile number format."""
        cleaned = re.sub(r"[\s\-\+]", "", v)
        # Remove country code if present
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not re.match(r"^[6-9]\d{9}$", cleaned):
            raise ValueError("Invalid mobile number. Must be a 10-digit Indian mobile number starting with 6-9")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, v: Optional[str]) -> str:
        """Validate preferred language is supported."""
        supported = {"en", "hi", "mr"}
        if v and v not in supported:
            raise ValueError(f"Unsupported language. Choose from: {', '.join(supported)}")
        return v or "en"

    @model_validator(mode="after")
    def passwords_match(self):
        """Validate that password and confirm_password match."""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    """Schema for user login."""

    mobile: str = Field(..., description="Registered mobile number")
    password: str = Field(..., description="Account password")


class TokenResponse(BaseModel):
    """Schema for JWT token response with language preference."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    preferred_language: str = "en"

class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class LanguageUpdateRequest(BaseModel):
    """Schema for updating language preference."""
    preferred_language: str = Field(..., description="Language code (en/hi/mr)")

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        supported = {"en", "hi", "mr"}
        if v not in supported:
            raise ValueError(f"Unsupported language. Choose from: {', '.join(supported)}")
        return v


class UserResponse(BaseModel):
    """Schema for user profile response."""

    id: UUID
    name: str
    mobile: str
    email: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    village: Optional[str] = None
    role: str
    preferred_language: str = "en"
    primary_crops: Optional[str] = None
    land_size_acres: Optional[float] = None

    class Config:
        from_attributes = True
