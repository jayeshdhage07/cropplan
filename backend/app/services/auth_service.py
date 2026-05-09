"""
Authentication service handling user registration and login.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.logging import logger


class AuthService:
    """Service layer for authentication operations."""

    @staticmethod
    def register(db: Session, user_data: UserRegister) -> User:
        """
        Register a new user.
        
        Args:
            db: Database session.
            user_data: Registration data.
        
        Returns:
            Created User model instance.
        
        Raises:
            HTTPException: If mobile number is already registered.
        """
        # Check if mobile already exists
        existing_user = db.query(User).filter(User.mobile == user_data.mobile).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Mobile number already registered",
            )

        # Check if email already exists (if provided)
        if user_data.email:
            existing_email = (
                db.query(User).filter(User.email == user_data.email).first()
            )
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )

        # Create user
        new_user = User(
            name=user_data.name,
            mobile=user_data.mobile,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            district=user_data.district,
            state=user_data.state or "Maharashtra",
            role="farmer",
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"New user registered: {new_user.mobile} ({new_user.name})")
        return new_user

    @staticmethod
    def login(db: Session, login_data: UserLogin) -> TokenResponse:
        """
        Authenticate user and return JWT token.
        
        Args:
            db: Database session.
            login_data: Login credentials.
        
        Returns:
            TokenResponse with JWT access token.
        
        Raises:
            HTTPException: If credentials are invalid.
        """
        user = db.query(User).filter(User.mobile == login_data.mobile).first()

        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid mobile number or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create JWT token with user claims
        token = create_access_token(
            data={"sub": str(user.id), "role": user.role, "name": user.name}
        )

        logger.info(f"User logged in: {user.mobile}")
        return TokenResponse(
            access_token=token,
            user_id=str(user.id),
            name=user.name,
            role=user.role,
        )
