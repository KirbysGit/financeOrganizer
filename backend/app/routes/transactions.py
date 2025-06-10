# Imports.
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi import APIRouter, Depends

# Local Imports.
from app.utils.db_utils import get_db
from app.database import Transaction, UploadedFile
from app.models import TransactionOut, TransactionCreate
from app.utils.type_label_map import NEGATIVE_TYPES, POSITIVE_TYPES

router = APIRouter()    # Sets Up Modular Sub-Router for FastAPI.

# ----------------------------------------------------------------------- Get All Transactions.
@router.get("/transactions", response_model=list[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    # Query For All TransactionItems, And Return All.
    return db.query(Transaction).all()  

# ----------------------------------------------------------------------- Clears Entire Database.
@router.delete("/clear")
def clear_transactions(db: Session = Depends(get_db)):
    # Query For Transaction Items, And Delete All.
    db.query(Transaction).delete()

    # Query For UploadedFile Items, And Delete All.
    db.query(UploadedFile).delete()

    # Commit To Database.     
    db.commit()

    # Return Success Message.                       
    return {"message": "All transactions deleted."}

# ----------------------------------------------------------------------- Manually Add Transaction.

@router.post("/transactions/", response_model=TransactionOut, status_code=201)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # Get Transacation Data From Request.
    tx_data = transaction.dict()

    # Casing Simplification For Type Of Transaction.
    tx_type = tx_data["type"].lower()

    # Set Amount Var.
    amount = tx_data["amount"]

    # Check If The Transaction Type Is "Negative", Then Determine If Amount Is Pos or Neg.
    if tx_type in NEGATIVE_TYPES and amount > 0:
        tx_data["amount"] = -amount
    elif tx_type in POSITIVE_TYPES and amount < 0:
        tx_data["amount"] = -amount

    # Create New Transaction.
    new_tx = Transaction(**tx_data)
    
    # Add, Commmit, And Refresh Database.
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    # Return New Transaction.
    return new_tx

# ----------------------------------------------------------------------- Delete Individual Transaction.
@router.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    # Find Transaction By ID.
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    # Delete Transaction.
    db.delete(transaction)

    # Commit To Database.
    db.commit()
    
    # Return Success Message.
    return {"message": f"Transaction {transaction_id} deleted successfully"}

