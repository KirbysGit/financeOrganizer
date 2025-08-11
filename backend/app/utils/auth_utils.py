# Auth Utils.
#
# Functions :
#   - 'verify_token' - Verify And Decode A JWT Token.
#   - 'get_current_user' - Get The Current Authenticated User From JWT Token In Cookies.

# Imports.
import jwt
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, status, Request

# Local Imports.
from ..database import User
from ..utils.db_utils import get_db

# JWT Settings.
SECRET_KEY = "your-secret-key-here"  # In Production, Use Environment Variable.
ALGORITHM = "HS256"

# -------------------------------------------------------- Verify Token.
def verify_token(token: str) -> Optional[dict]:
    """Verify And Decode A JWT Token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# -------------------------------------------------------- Get Current User.
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Get The Current Authenticated User From JWT Token In Cookies."""
    
    # Extract Token From Cookies.
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify And Decode Token.
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract User ID From Token.
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get User From Database.
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check If User Is Active.
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    return user 