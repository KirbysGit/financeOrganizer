from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal, Transaction
from app.models import TransactionOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally: 
        db.close()

@router.get("/transactions", response_model=list[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).all()