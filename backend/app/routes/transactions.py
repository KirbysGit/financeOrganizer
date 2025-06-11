# Imports.
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi import APIRouter, Depends

# Local Imports.
from app.utils.db_utils import get_db
from app.database import Transaction, FileUpload, Account
from app.models import TransactionOut, TransactionCreate
from app.utils.type_label_map import NEGATIVE_TYPES, POSITIVE_TYPES

router = APIRouter()    # Sets Up Modular Sub-Router for FastAPI.

# ----------------------------------------------------------------------- Get All Transactions.
@router.get("/transactions", response_model=list[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    # Query For All TransactionItems, And Return All.
    return db.query(Transaction).all()  

# ----------------------------------------------------------------------- Get Transactions with Account Info.
@router.get("/transactions/detailed")
def get_detailed_transactions(db: Session = Depends(get_db)):
    
    transactions = db.query(Transaction).join(Account, Transaction.account_id == Account.account_id, isouter=True).all()
    
    result = []
    for tx in transactions:
        tx_dict = {
            "id": tx.id,
            "transaction_id": tx.transaction_id,
            "date": tx.date,
            "amount": tx.amount,
            "vendor": tx.vendor,
            "merchant_name": tx.merchant_name,
            "description": tx.description,
            "category_primary": tx.category_primary,
            "category_detailed": tx.category_detailed,
            "transaction_type": tx.transaction_type,
            "source": tx.source,
            "file": tx.file,
            "location_city": tx.location_city,
            "location_state": tx.location_state,
            "created_at": tx.created_at,
            "account": {
                "name": tx.account.name if tx.account else None,
                "type": tx.account.type if tx.account else None,
                "subtype": tx.account.subtype if tx.account else None,
                "mask": tx.account.mask if tx.account else None
            } if tx.account else None
        }
        result.append(tx_dict)
    
    return result

# ----------------------------------------------------------------------- Get All Accounts.
@router.get("/accounts")
def get_accounts(db: Session = Depends(get_db)):
    """Get all connected accounts with their current balances."""
    accounts = db.query(Account).filter(Account.is_active == True).all()
    
    result = []
    for account in accounts:
        # Count transactions for this account
        tx_count = db.query(Transaction).filter(Transaction.account_id == account.account_id).count()
        
        account_dict = {
            "id": account.id,
            "account_id": account.account_id,
            "name": account.name,
            "official_name": account.official_name,
            "type": account.type,
            "subtype": account.subtype,
            "mask": account.mask,
            "current_balance": account.current_balance,
            "available_balance": account.available_balance,
            "currency": account.currency,
            "transaction_count": tx_count,
            "updated_at": account.updated_at
        }
        result.append(account_dict)
    
    return result

# ----------------------------------------------------------------------- Clears Entire Database.
@router.delete("/clear")
def clear_transactions(db: Session = Depends(get_db)):
    # Query For Transaction Items, And Delete All.
    db.query(Transaction).delete()

    # Query For FileUpload Items, And Delete All.
    db.query(FileUpload).delete()

    # Commit To Database.     
    db.commit()

    # Return Success Message.                       
    return {"message": "All transactions deleted."}

# ----------------------------------------------------------------------- Manually Add Transaction.
@router.post("/transactions/", response_model=TransactionOut, status_code=201)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # Get Transaction Data From Request.
    tx_data = transaction.dict()

    # Casing Simplification For Type Of Transaction.
    tx_type = tx_data.get("type", "").lower()

    # Set Amount Var.
    amount = tx_data.get("amount", 0)

    # Check If The Transaction Type Is "Negative", Then Determine If Amount Is Pos or Neg.
    if tx_type in NEGATIVE_TYPES and amount > 0:
        tx_data["amount"] = -amount
    elif tx_type in POSITIVE_TYPES and amount < 0:
        tx_data["amount"] = -amount

    # Map old field names to new schema
    new_tx_data = {
        "date": tx_data.get("date"),
        "amount": tx_data.get("amount"),
        "vendor": tx_data.get("vendor"),
        "description": tx_data.get("description"),
        "category_primary": tx_data.get("type", "other"),  # Map old 'type' to 'category_primary'
        "source": "manual",
        "file": "manual",
        "created_at": tx_data.get("created_at"),
        "updated_at": tx_data.get("updated_at")
    }

    # Create New Transaction.
    new_tx = Transaction(**new_tx_data)
    
    # Add, Commit, And Refresh Database.
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
    
    if not transaction:
        return {"error": "Transaction not found"}
    
    # Delete Transaction.
    db.delete(transaction)

    # Commit To Database.
    db.commit()
    
    # Return Success Message.
    return {"message": f"Transaction {transaction_id} deleted successfully"}

# ----------------------------------------------------------------------- Get Transaction Statistics.
@router.get("/stats")
def get_transaction_stats(db: Session = Depends(get_db)):
    # Basic Counts For Transactions & Accounts.
    total_transactions = db.query(Transaction).count()
    total_accounts = db.query(Account).filter(Account.is_active == True).count()
    
    # Breakdown Amount From Each Source.
    plaid_count = db.query(Transaction).filter(Transaction.source == "plaid").count()
    csv_count = db.query(Transaction).filter(Transaction.source == "csv").count()
    manual_count = db.query(Transaction).filter(Transaction.source == "manual").count()
    
    # Category Breakdown (Top 5 Spending Categories).
    top_categories = db.query(
        Transaction.category_primary,
        func.count(Transaction.id).label('count'),
        func.sum(Transaction.amount).label('total_amount')
    ).group_by(Transaction.category_primary).order_by(func.count(Transaction.id).desc()).limit(5).all()
    
    # Account Balanaces.
    total_balance = db.query(func.sum(Account.current_balance)).filter(Account.is_active == True).scalar() or 0
    
    # Return Stats For All Transactions.
    return {
        "totals": {
            "transactions": total_transactions,
            "accounts": total_accounts,
            "total_balance": total_balance
        },
        "sources": {
            "plaid": plaid_count,
            "csv": csv_count,
            "manual": manual_count
        },
        "top_categories": [
            {
                "category": cat.category_primary,
                "count": cat.count,
                "total_amount": float(cat.total_amount) if cat.total_amount else 0
            }
            for cat in top_categories
        ]
    }

