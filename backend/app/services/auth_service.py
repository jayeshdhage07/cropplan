"""
Authentication service handling user registration and login.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_refresh_token
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

        # Create user with enhanced farmer fields
        new_user = User(
            name=user_data.name,
            mobile=user_data.mobile,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            district=user_data.district,
            state=user_data.state or "Maharashtra",
            village=user_data.village,
            preferred_language=user_data.preferred_language or "en",
            primary_crops=user_data.primary_crops,
            land_size_acres=user_data.land_size_acres,
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
            TokenResponse with JWT access token and preferred language.
        
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

        # Create JWT tokens
        token_data = {"sub": str(user.id), "role": user.role, "name": user.name}
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)

        logger.info(f"User logged in: {user.mobile}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=str(user.id),
            name=user.name,
            role=user.role,
            preferred_language=user.preferred_language or "en",
        )

    @staticmethod
    def refresh_token(db: Session, refresh_token: str) -> TokenResponse:
        """
        Generate new access token from refresh token.
        """
        payload = decode_refresh_token(refresh_token)
        user_id = payload.get("sub")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token_data = {"sub": str(user.id), "role": user.role, "name": user.name}
        new_access_token = create_access_token(data=token_data)
        new_refresh_token = create_refresh_token(data=token_data)
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user_id=str(user.id),
            name=user.name,
            role=user.role,
            preferred_language=user.preferred_language or "en",
        )

    @staticmethod
    def update_language(db: Session, user_id: str, language: str) -> dict:
        """
        Update user's preferred language.
        
        Args:
            db: Database session.
            user_id: UUID of the user.
            language: Language code (en/hi/mr).
        
        Returns:
            Success message with updated language.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        user.preferred_language = language
        db.commit()
        
        logger.info(f"Language updated for user {user.mobile}: {language}")
        return {"message": "Language preference updated", "preferred_language": language}
