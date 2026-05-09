"""
Pydantic schemas for authentication (register, login, token responses).
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class UserRegister(BaseModel):
    """Schema for user registration."""

    name: str = Field(..., min_length=2, max_length=255, description="Full name")
    mobile: str = Field(
        ..., min_length=10, max_length=15, description="Mobile number"
    )
    email: Optional[str] = Field(None, description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    district: Optional[str] = Field(None, description="User's district")
    state: Optional[str] = Field("Maharashtra", description="User's state")


class UserLogin(BaseModel):
    """Schema for user login."""

    mobile: str = Field(..., description="Registered mobile number")
    password: str = Field(..., description="Account password")


class TokenResponse(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str

class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user profile response."""

    id: UUID
    name: str
    mobile: str
    email: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    role: str

    class Config:
        from_attributes = True
