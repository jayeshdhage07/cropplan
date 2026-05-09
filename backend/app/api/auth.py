"""
Authentication API routes.
Handles user registration, login, and profile retrieval.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse, RefreshTokenRequest
from app.services.auth_service import AuthService
from app.core.security import get_current_user
from app.models.user import User
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    - **name**: Full name of the user
    - **mobile**: Mobile number (unique)
    - **password**: Password (min 6 characters)
    - **district**: User's district (optional)
    - **state**: User's state (default: Maharashtra)
    """
    user = AuthService.register(db, user_data)
    return user


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with mobile number and password (JSON Payload - Used by Angular Frontend).
    Returns a JWT access token.
    """
    return AuthService.login(db, login_data)

@router.post("/swagger-login", response_model=TokenResponse, include_in_schema=False)
def swagger_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint specifically for Swagger UI Authorization button.
    Maps Swagger's 'username' field to our 'mobile' field.
    """
    login_data = UserLogin(mobile=form_data.username, password=form_data.password)
    return AuthService.login(db, login_data)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Get a new access token using a valid refresh token.
    """
    return AuthService.refresh_token(db, request.refresh_token)

@router.post("/logout")
def logout():
    """
    Logout user. In stateless JWT, actual logout is handled client-side
    by removing tokens, but this endpoint provides a logical hook.
    """
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the profile of the currently authenticated user.
    Requires a valid JWT token in the Authorization header.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
