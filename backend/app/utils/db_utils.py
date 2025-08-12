# DB Utils.
#
# Functions :
#   - 'get_db' - Get Database Session.
#   - 'check_db_connection' - Check Database Connection.

# Imports.
from app.database import get_session
from fastapi import HTTPException, status

# -------------------------------------------------------- Get Database Session.
def get_db():
    db = get_session()   # Get database session (may be None if connection failed)
    if db is None:
        # If no database connection, raise an error instead of yielding None
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available. Please try again later."
        )
    
    try:
        yield db          # Provide The Session To The Route That Depends On it.
    finally:
        db.close()        # Ensure Session Is Properly Closed After Request Finishes.

# -------------------------------------------------------- Check Database Connection.
def check_db_connection(db):
    """Check if database connection is available and raise appropriate error if not"""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available. Please try again later."
        )
    return db