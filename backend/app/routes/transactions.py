# Imports.
from sqlalchemy import func, extract, text
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta

# Local Imports.
from app.utils.db_utils import get_db
from app.models import TransactionOut, TransactionCreate
from app.utils.type_label_map import NEGATIVE_TYPES, POSITIVE_TYPES
from app.database import Transaction, FileUpload, Account, Institution

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
def clear_database(db: Session = Depends(get_db)):
    try:
        # Disable foreign key checks temporarily
        if "sqlite" in str(db.bind.url):
            db.execute(text("PRAGMA foreign_keys = OFF"))
        else:
            db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        # Clear All Tables (In Order Of Dependencies).
        db.query(Transaction).delete()
        db.query(FileUpload).delete()
        db.query(Account).delete()
        db.query(Institution).delete()
        
        # Re-enable foreign key checks
        if "sqlite" in str(db.bind.url):
            db.execute(text("PRAGMA foreign_keys = ON"))
        else:
            db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        
        # Commit Changes.
        db.commit()
        
        # Verify tables are empty
        transaction_count = db.query(Transaction).count()
        file_count = db.query(FileUpload).count()
        account_count = db.query(Account).count()
        institution_count = db.query(Institution).count()
        
        # Return Success Msg with verification.
        return {
            "message": "Database cleared successfully",
            "tables_cleared": ["transactions", "file_uploads", "accounts", "institutions"],
            "verification": {
                "transactions": transaction_count,
                "file_uploads": file_count,
                "accounts": account_count,
                "institutions": institution_count
            }
        }
    except Exception as e:
        # Any Issues, Rollback To Last Commit.
        db.rollback()
        
        # Re-enable foreign key checks in case of error
        try:
            if "sqlite" in str(db.bind.url):
                db.execute(text("PRAGMA foreign_keys = ON"))
            else:
                db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        except:
            pass

        # Return HTTP Error.
        raise HTTPException(
            status_code=500,
            detail=f"Error clearing database: {str(e)}"
        )

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

# ----------------------------------------------------------------------- Get Stats.
@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    # Get Current Date & Calculate Time Periods.
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1).date()
    start_of_week = (now - timedelta(days=now.weekday())).date()
    start_of_year = datetime(now.year, 1, 1).date()
    
    print(f"Debug - Current date: {now}")
    print(f"Debug - Start of month: {start_of_month}")
    print(f"Debug - Start of week: {start_of_week}")
    print(f"Debug - Start of year: {start_of_year}")
    
    # Get All Transactions.
    transactions = db.query(Transaction).all()
    print(f"Debug - Total transactions: {len(transactions)}")
    
    # Print sample of transaction dates
    for t in transactions[:5]:
        print(f"Debug - Transaction: date={t.date}, amount={t.amount}, type={type(t.date)}")
    
    # Total income (all time)
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0
    ).scalar() or 0
    
    # Monthly income (current month)
    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_month
    ).scalar() or 0
    
    print(f"Debug - Monthly income query: {monthly_income}")
    print(f"Debug - Monthly income filter conditions:")
    print(f"  - amount > 0")
    print(f"  - date >= {start_of_month}")
    
    # Weekly income (current week)
    weekly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_week
    ).scalar() or 0
    
    # Year-to-date income
    ytd_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_year
    ).scalar() or 0
    
    # Total spending (all time)
    total_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0
    ).scalar() or 0
    
    # Monthly spending (current month)
    monthly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_month
    ).scalar() or 0
    
    # Weekly spending (current week)
    weekly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_week
    ).scalar() or 0
    
    # Year-to-date spending
    ytd_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_year
    ).scalar() or 0
    
    # Calculate cash flow
    monthly_cash_flow = monthly_income + monthly_spending
    weekly_cash_flow = weekly_income + weekly_spending
    ytd_cash_flow = ytd_income + ytd_spending
    
    # Get income by category
    income_by_category = db.query(
        Transaction.category_primary,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.amount > 0
    ).group_by(
        Transaction.category_primary
    ).all()
    
    # Get spending by category (top 5)
    spending_by_category = db.query(
        Transaction.category_primary,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.amount < 0
    ).group_by(
        Transaction.category_primary
    ).order_by(
        func.sum(Transaction.amount).asc()
    ).limit(5).all()
    
    # Get average transaction amounts
    avg_income = db.query(func.avg(Transaction.amount)).filter(
        Transaction.amount > 0
    ).scalar() or 0
    
    avg_spending = db.query(func.avg(Transaction.amount)).filter(
        Transaction.amount < 0
    ).scalar() or 0
    
    # Get transaction frequency
    transaction_count = db.query(Transaction).count()
    income_count = db.query(Transaction).filter(Transaction.amount > 0).count()
    spending_count = db.query(Transaction).filter(Transaction.amount < 0).count()
    
    # Get account statistics
    accounts = db.query(Account).all()
    total_assets = sum(acc.current_balance for acc in accounts if acc.type == 'depository')
    total_liabilities = sum(acc.current_balance for acc in accounts if acc.type == 'credit')
    net_worth = total_assets + total_liabilities
    
    # Get source statistics
    source_stats = {}
    for source in ['plaid', 'csv', 'manual']:
        source_transactions = db.query(Transaction).filter(Transaction.source == source).all()
        source_stats[source] = {
            'count': len(source_transactions),
            'total': sum(t.amount for t in source_transactions)
        }
    
    return {
        "totals": {
            "transactions": transaction_count,
            "accounts": len(accounts),
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": net_worth,
            "average_income": avg_income,
            "average_spending": avg_spending
        },
        "income": {
            "total": total_income,
            "this_month": monthly_income,
            "this_week": weekly_income,
            "year_to_date": ytd_income,
            "by_category": [{"category": cat, "amount": amt} for cat, amt in income_by_category]
        },
        "spending": {
            "total": total_spending,
            "this_month": monthly_spending,
            "this_week": weekly_spending,
            "year_to_date": ytd_spending,
            "by_category": [{"category": cat, "amount": amt} for cat, amt in spending_by_category]
        },
        "cash_flow": {
            "this_month": monthly_cash_flow,
            "this_week": weekly_cash_flow,
            "year_to_date": ytd_cash_flow
        },
        "accounts": {
            "by_type": {
                "depository": total_assets,
                "credit": total_liabilities,
                "loan": sum(acc.current_balance for acc in accounts if acc.type == 'loan'),
                "investment": sum(acc.current_balance for acc in accounts if acc.type == 'investment')
            },
            "total": len(accounts)
        },
        "sources": source_stats
    }

