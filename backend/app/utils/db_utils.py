from app.database import SessionLocal

def get_db():
    db = SessionLocal()   # Create A New Database Session.
    try:
        yield db          # Provide The Session To The Route That Depends On it.
    finally:
        db.close()        # Ensure Session Is Properly Closed After Request Finishes.