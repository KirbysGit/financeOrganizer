# Account Routes.

# Imports.
import jwt
import requests
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request

# Local Imports.
from app.config import google_config
from app.utils.db_utils import get_db
from app.database import SessionLocal, User
from app.utils.auth_utils import get_current_user
from app.models import UserCreate, UserLogin, UserOut, AuthResponse, GoogleAuthCodeRequest

# Create Router Instance.
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password Hashing Context. 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Settings.
SECRET_KEY = "your-secret-key-here"  # In Production, Use Environment Variable.
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days (7 * 24 * 60 = 10080 minutes)
REFRESH_TOKEN_EXPIRE_DAYS = 30


# -------------------------------------------------------- Password Utilities.
def verify_password(
        plain_password: str, 
        hashed_password: str
    ) -> bool:
    """Verify A Password Against A Hashed Password."""

    try:
        # Verifies The Password Against The Hash.
        result = pwd_context.verify(plain_password, hashed_password)

        # Returns The Result.
        return result
    except Exception as e:
        return False

def get_password_hash(
        password: str
    ) -> str:
    """Hash A Password."""

    # Hashes The Password.
    return pwd_context.hash(password)

# -------------------------------------------------------- JWT Utilities.
def create_access_token(
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
    """Create A JWT Access Token."""
    to_encode = data.copy()

    # Decides How Long The Token Is Valid For.
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Encodes The Token W/ Expiration Date.
    to_encode.update({"exp": expire})

    # Encodes The Token W/ Secret Key & Algorithm.
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # Returns The Token.
    return encoded_jwt

def create_refresh_token(
        data: dict
    ) -> str:
    """Create A JWT Refresh Token."""
    to_encode = data.copy()

    # Decides How Long The Token Is Valid For. (30 Days)
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # Adds Expiration Date & Type To The Token.
    to_encode.update({"exp": expire, "type": "refresh"})

    # Encodes The Token W/ Secret Key & Algorithm.
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # Returns The Token.
    return encoded_jwt

def verify_token(
        token: str
    ) -> Optional[dict]:
    """Verify And Decode A JWT Token."""
    try:
        # Decodes The Token W/ Secret Key & Algorithm.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Returns The Payload.
        return payload
    
    # If The Token Is Invalid, Returns None.
    except jwt.PyJWTError:
        return None

def create_auth_tokens_and_cookies(
        user: User, response: Response
    ) -> tuple[str, str]:
    """Create Auth Tokens & Cookies."""

    # Create Access Token & Refresh Token.
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    # Set HTTP-only Cookies. (Updates 'secure' to True in Production.)
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )
    
    return access_token, refresh_token

# -------------------------------------------------------- User Utilities.
def get_user_by_email(
        db: Session, 
        email: str
    ) -> Optional[User]:
    """Get A User By Email Address."""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(
        db: Session, 
        email: str, password: str
    ) -> Optional[User]:
    """Authenticate A User With Email And Password."""
    user = get_user_by_email(db, email)
    
    # If User Doesn't Exist, Returns None.
    if not user:
        return None
    
    # Check If User Is A Google OAuth User (No Associated Passwords).
    if not user.hashed_password or user.hashed_password == "":
        return None
    
    # Verify Password For Regular Users.
    if not verify_password(password, user.hashed_password):
        return None
    
    # Returns The User.
    return user

# -------------------------------------------------------- API Endpoints.

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(
        user_data: UserCreate, 
        db: Session = Depends(get_db), 
        response: Response = None
    ) -> AuthResponse:
    """Register A New User Account."""
    
    # Check If User Already Exists. If So, Returns 400 Bad Request.
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    # Hash New User's Password.
    hashed_password = get_password_hash(user_data.password)

    # Create New User Object Based On Provided Data.
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
    
    # Create Access Token & Refresh Token.
    access_token, refresh_token = create_auth_tokens_and_cookies(db_user, response)
    
    # Update Last Login.
    db_user.last_login = datetime.utcnow()

    # Commit Changes To DB.
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
        message="User Registered Successfully!"
    )

# -------------------------------------------------------- Login User.
@router.post("/login", response_model=AuthResponse)
def login_user(
        user_credentials: UserLogin, 
        db: Session = Depends(get_db), 
        response: Response = None
    ) -> AuthResponse:
    """Authenticate & Login A User."""
    
    # Authenticate User.
    user = authenticate_user(db, user_credentials.email, user_credentials.password)

    # If User Doesn't Exist, Returns 401 Unauthorized.
    if not user:
        # Check If User Exists But Is A Google OAuth User.
        existing_user = get_user_by_email(db, user_credentials.email)

        # If User Exists But Is A Google OAuth User, Returns 401 Unauthorized.
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
    
    # Check If User Is Active.
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User Account Is Deactivated."
        )
    
    # Create Access Token & Refresh Token.
    access_token, refresh_token = create_auth_tokens_and_cookies(user, response)
    
    # Update Last Login.
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Return Auth Response.
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

# -------------------------------------------------------- Refresh Token.
@router.post("/refresh", response_model=AuthResponse)
def refresh_token(
        request: Request, 
        response: Response = None, 
        db: Session = Depends(get_db)
    ) -> AuthResponse:
    """Refresh The Access Token Using A Refresh Token."""
    
    # Get Refresh Token From Cookies.
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    # Verify Refresh Token.
    try:
        # Decode Refresh Token.
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        # Check If Token Is A Refresh Token.
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Get User ID & Email From Token.
        user_id = payload.get("sub")

        # Get User Email From Token.
        email = payload.get("email")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get User From Database.
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create New Access Token & Refresh Token.
    access_token, new_refresh_token = create_auth_tokens_and_cookies(user, response)
    
    # Return Auth Response.
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
        message="Token refreshed successfully"
    )

# -------------------------------------------------------- Logout.
@router.post("/logout")
def logout(
        response: Response = None
    ) -> dict:
    """Logout User By Clearing Cookies."""
    
    # Clear Cookies.
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    
    return {"message": "Logged Out Successfully!"}

# -------------------------------------------------------- Google Auth Code Authentication.
@router.post("/google-code", response_model=AuthResponse)
def google_auth_code(
        auth_data: GoogleAuthCodeRequest, 
        db: Session = Depends(get_db), 
        response: Response = None
    ) -> AuthResponse:
    """Authenticate Or Register A User W/ Google OAuth Using Authorization Code."""
    
    try:
        # Exchange Authorization Code For Tokens.
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": google_config.client_id,
            "client_secret": google_config.client_secret,
            "code": auth_data.code,
            "grant_type": "authorization_code",
            "redirect_uri": auth_data.redirect_uri
        }
        
        # Exchange Authorization Code For Tokens.
        token_response = requests.post(token_url, data=token_data)

        # Raise For Status.
        token_response.raise_for_status()

        # Get Tokens.
        tokens = token_response.json()
        
        # Get User Info Using The Access Token.
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info_response.raise_for_status()
        user_info = user_info_response.json()
        
        # Extract User Information.
        google_user_data = {
            "email": user_info["email"],
            "first_name": user_info["given_name"],
            "last_name": user_info["family_name"],
            "google_id": user_info["id"],
            "picture": user_info.get("picture")
        }
        
        # Check If User Exists By Google ID.
        existing_user_by_google = db.query(User).filter(User.google_id == google_user_data["google_id"]).first()
        
        # Check If User Exists By Email.
        existing_user_by_email = get_user_by_email(db, google_user_data["email"])

        # If User Exists By Google ID, Authenticate Them.
        if existing_user_by_google:
            user = existing_user_by_google
            message = "Google Authentication Successful!"
        elif existing_user_by_email:
            # Check If The Existing User Has A Password (Manual Account).
            if existing_user_by_email.hashed_password and existing_user_by_email.hashed_password.strip():
                # Manual Account Exists - Prevent Google SSO.
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"An account with email {google_user_data['email']} already exists. Please sign in with your password instead of using Google Sign-In."
                )
            else:
                # User Exists With Email But No Password - Link Google Account.
                user = existing_user_by_email
                user.google_id = google_user_data["google_id"]
                user.picture = google_user_data["picture"]
                user.updated_at = datetime.utcnow()
                message = "Google account linked successfully"
        else:
            # Create New User W/ Google Data.
            user = User(
                first_name=google_user_data["first_name"],
                last_name=google_user_data["last_name"],
                email=google_user_data["email"],
                google_id=google_user_data["google_id"],
                picture=google_user_data["picture"],
                hashed_password="",  # No Password For Google Users.
                is_verified=True,  # Google Accounts Are Pre-Verified.
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            # Add User To Database.
            db.add(user)
            message = "Google Account Created Successfully!"
        
        # Update Last Login.
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        # Create Access Token & Refresh Token.
        access_token, refresh_token = create_auth_tokens_and_cookies(user, response)
        
        # Return Auth Response.
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
        
    except HTTPException:
        # Re-raise HTTP Exceptions (Like 409 Conflict) Without Modification.
        raise
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

# -------------------------------------------------------- Get Current User.
@router.get("/me", response_model=UserOut)
def get_current_user(
        current_user: User = Depends(get_current_user)
    ) -> UserOut:
    """Get Current Authenticated User Information."""

    # Return Current User.
    return current_user
