# Imports.
import jwt
import requests
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status

# Local Imports.
from app.utils.db_utils import get_db
from app.database import SessionLocal, User
from app.models import UserCreate, UserLogin, UserOut, AuthResponse, GoogleAuthRequest, GoogleAuthCodeRequest
from app.config import google_config

# Create Router Instance.
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password Hashing Context.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Settings.
SECRET_KEY = "your-secret-key-here"  # In Production, Use Environment Variable.
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# -------------------------------------------------------- Password Utilities.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify A Plain Password Against Its Hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash A Password."""
    return pwd_context.hash(password)

# -------------------------------------------------------- JWT Utilities.
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create A JWT Access Token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify And Decode A JWT Token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# -------------------------------------------------------- User Utilities.
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get A User By Email Address."""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate A User With Email And Password."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    # Check if user is a Google OAuth user (no password)
    if not user.hashed_password or user.hashed_password == "":
        return None  # Google OAuth users can't login with password
    
    # Verify password for regular users
    if not verify_password(password, user.hashed_password):
        return None
    return user

# -------------------------------------------------------- API Endpoints.

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register A New User Account."""
    
    # Check If User Already Exists.
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    # Create New User.
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        hashed_password=hashed_password,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Add User To Database.
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )
    
    # Create Access Token.
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id), "email": db_user.email},
        expires_delta=access_token_expires
    )
    
    # Update Last Login.
    db_user.last_login = datetime.utcnow()
    db.commit()
    
    # Return Auth Response.
    return AuthResponse(
        user=UserOut(
            id=db_user.id,
            first_name=db_user.first_name,
            last_name=db_user.last_name,
            email=db_user.email,
            is_active=db_user.is_active,
            google_id=db_user.google_id,
            picture=db_user.picture,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        ),
        access_token=access_token,
        message="User registered successfully"
    )

# -------------------------------------------------------- Login User.
@router.post("/login", response_model=AuthResponse)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and login a user."""
    
    # Authenticate user.
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        # Check if user exists but is a Google OAuth user
        existing_user = get_user_by_email(db, user_credentials.email)
        if existing_user and (not existing_user.hashed_password or existing_user.hashed_password == ""):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account was created with Google. Please use Google Sign-In instead.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Check if user is active.
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    # Create access token.
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    # Update last login.
    user.last_login = datetime.utcnow()
    db.commit()
    
    return AuthResponse(
        user=UserOut(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            is_active=user.is_active,
            google_id=user.google_id,
            picture=user.picture,
            created_at=user.created_at,
            updated_at=user.updated_at
        ),
        access_token=access_token,
        message="Login successful"
    )

# -------------------------------------------------------- Google Authentication.
@router.post("/google", response_model=AuthResponse)
def google_auth(google_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user with Google OAuth."""
    
    # Check if user exists by Google ID
    existing_user_by_google = db.query(User).filter(User.google_id == google_data.google_id).first()
    
    # Check if user exists by email
    existing_user_by_email = get_user_by_email(db, google_data.email)
    
    if existing_user_by_google:
        # User exists with Google ID - authenticate them
        user = existing_user_by_google
        message = "Google authentication successful"
    elif existing_user_by_email:
        # User exists with email but no Google ID - link Google account
        user = existing_user_by_email
        user.google_id = google_data.google_id
        user.picture = google_data.picture
        user.updated_at = datetime.utcnow()
        message = "Google account linked successfully"
    else:
        # Create new user with Google data
        user = User(
            first_name=google_data.first_name,
            last_name=google_data.last_name,
            email=google_data.email,
            google_id=google_data.google_id,
            picture=google_data.picture,
            hashed_password="",  # No password for Google users
            is_verified=True,  # Google accounts are pre-verified
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(user)
        message = "Google account created successfully"
    
    try:
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process Google authentication"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    return AuthResponse(
        user=UserOut(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            is_active=user.is_active,
            google_id=user.google_id,
            picture=user.picture,
            created_at=user.created_at,
            updated_at=user.updated_at
        ),
        access_token=access_token,
        message=message
    )

# -------------------------------------------------------- Google Auth Code Authentication.
@router.post("/google-code", response_model=AuthResponse)
def google_auth_code(auth_data: GoogleAuthCodeRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user with Google OAuth using authorization code."""
    
    try:
        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": google_config.client_id,
            "client_secret": google_config.client_secret,
            "code": auth_data.code,
            "grant_type": "authorization_code",
            "redirect_uri": auth_data.redirect_uri
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()
        
        # Get user info using the access token
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info_response.raise_for_status()
        user_info = user_info_response.json()
        
        # Extract user information
        google_user_data = {
            "email": user_info["email"],
            "first_name": user_info["given_name"],
            "last_name": user_info["family_name"],
            "google_id": user_info["id"],
            "picture": user_info.get("picture")
        }
        
        # Check if user exists by Google ID
        existing_user_by_google = db.query(User).filter(User.google_id == google_user_data["google_id"]).first()
        
        # Check if user exists by email
        existing_user_by_email = get_user_by_email(db, google_user_data["email"])
        
        if existing_user_by_google:
            # User exists with Google ID - authenticate them
            user = existing_user_by_google
            message = "Google authentication successful"
        elif existing_user_by_email:
            # User exists with email but no Google ID - link Google account
            user = existing_user_by_email
            user.google_id = google_user_data["google_id"]
            user.picture = google_user_data["picture"]
            user.updated_at = datetime.utcnow()
            message = "Google account linked successfully"
        else:
            # Create new user with Google data
            user = User(
                first_name=google_user_data["first_name"],
                last_name=google_user_data["last_name"],
                email=google_user_data["email"],
                google_id=google_user_data["google_id"],
                picture=google_user_data["picture"],
                hashed_password="",  # No password for Google users
                is_verified=True,  # Google accounts are pre-verified
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            message = "Google account created successfully"
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )
        
        return AuthResponse(
            user=UserOut(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                is_active=user.is_active,
                google_id=user.google_id,
                picture=user.picture,
                created_at=user.created_at,
                updated_at=user.updated_at
            ),
            access_token=access_token,
            message=message
        )
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to exchange authorization code: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process Google authentication: {str(e)}"
        )

@router.get("/me", response_model=UserOut)
def get_current_user():
    """Get current authenticated user information."""
    # This is a placeholder - you'll need to implement proper token extraction
    # from the Authorization header in a real implementation
    raise HTTPException(status_code=401, detail="Not authenticated")
