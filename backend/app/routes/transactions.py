# Imports.
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi import APIRouter, Depends

# Local Imports.
from app.database import Transaction, UploadedFile
from app.models import TransactionOut, TransactionCreate

router = APIRouter()    # Sets Up Modular Sub-Router for FastAPI.

def get_db():
    db = SessionLocal() # Create A New Database Session.
    try: 
        yield db        # Provide The Session To The Route That Depends On It.
    finally: 
        db.close()      # Ensure Session Is Properly Closed After Request Finishes.

# ----------------------------------------------------------------------- Get All Transactions.
@router.get("/transactions", response_model=list[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).all()  # Query For All TransactionItems, And Return All.

# ----------------------------------------------------------------------- Clears Entire Database.
@router.delete("/clear")
def clear_transactions(db: Session = Depends(get_db)):
    db.query(Transaction).delete()                  # Query For Transaction Items, And Delete All.
    db.query(UploadedFile).delete()                 # Query For UploadedFile Items, And Delete All.
    db.commit()                                     # Commit To Database.
    return {"message": "All transactions deleted."} # Return Success Message.

# ----------------------------------------------------------------------- Manually Add Transaction.

NEGATIVE_TYPES = {"sale", "fee", "interest", "adjustment"}
POSITIVE_TYPES = {"refund", "payment", "transfer"}

@router.post("/transactions/", response_model=TransactionOut, status_code=201)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    tx_data = transaction.dict()

    tx_type = tx_data["type"].lower()
    amount = tx_data["amount"]

    if tx_type in NEGATIVE_TYPES and amount > 0:
        tx_data["amount"] = -amount
    elif tx_type in POSITIVE_TYPES and amount < 0:
        tx_data["amount"] = -amount

    new_tx = Transaction(**tx_data)
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx

