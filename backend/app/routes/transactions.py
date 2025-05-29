# Imports.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal, Transaction, UploadedFile
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

@router.delete("/clear")
def clear_transactions(db: Session = Depends(get_db)):
    db.query(Transaction).delete()
    db.query(UploadedFile).delete()
    db.commit()
    return {"message": "All transactions deleted."}

