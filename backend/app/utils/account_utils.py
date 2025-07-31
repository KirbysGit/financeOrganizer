# Imports.
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Tuple
from datetime import datetime, date, timedelta

# Local Imports.
from ..database import Account, AccountBalanceHistory, Transaction

# -------------------------------------------------------- Account Balance Tracking.

def create_account_balance_snapshot(
    db: Session, 
    user_id: int, 
    snapshot_date: date = None
) -> List[AccountBalanceHistory]:
    """Create balance snapshots for all user accounts."""
    
    if snapshot_date is None:
        snapshot_date = date.today()
    
    # Get all active accounts for the user
    accounts = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).all()
    
    snapshots = []
    
    # Create snapshots for each account
    for account in accounts:
        # Check if snapshot already exists for this date
        existing = db.query(AccountBalanceHistory).filter(
            AccountBalanceHistory.user_id == user_id,
            AccountBalanceHistory.account_id == account.account_id,
            AccountBalanceHistory.snapshot_date == snapshot_date
        ).first()
        
        if existing:
            # Update existing snapshot
            existing.current_balance = account.current_balance
            existing.available_balance = account.available_balance
            existing.limit = account.limit
            existing.account_name = account.name
            existing.account_type = account.type
            existing.account_subtype = account.subtype
            existing.currency = account.currency
        else:
            # Create new snapshot
            snapshot = AccountBalanceHistory(
                user_id=user_id,
                account_id=account.account_id,
                snapshot_date=snapshot_date,
                current_balance=account.current_balance,
                available_balance=account.available_balance,
                limit=account.limit,
                account_name=account.name,
                account_type=account.type,
                account_subtype=account.subtype,
                currency=account.currency
            )
            snapshots.append(snapshot)
    
    # Handle cash account (transactions with account_id = None)
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),
        Transaction.user_id == user_id
    ).scalar() or 0
    
    if cash_balance != 0:
        # Check if cash snapshot already exists
        existing_cash = db.query(AccountBalanceHistory).filter(
            AccountBalanceHistory.user_id == user_id,
            AccountBalanceHistory.account_id.is_(None),
            AccountBalanceHistory.snapshot_date == snapshot_date
        ).first()
        
        if existing_cash:
            existing_cash.current_balance = cash_balance
            existing_cash.available_balance = cash_balance
        else:
            cash_snapshot = AccountBalanceHistory(
                user_id=user_id,
                account_id=None,
                snapshot_date=snapshot_date,
                current_balance=cash_balance,
                available_balance=cash_balance,
                limit=0,
                account_name="Cash",
                account_type="cash",
                account_subtype="cash",
                currency="USD"
            )
            snapshots.append(cash_snapshot)
    
    # Add snapshots to database
    if snapshots:
        db.add_all(snapshots)
        db.commit()
    
    return snapshots

# -------------------------------------------------------- Enhanced Financial Calculations.

def calculate_account_financial_impact(
    db: Session, 
    user_id: int
) -> Dict[str, float]:
    """Calculate total assets, liabilities, and net worth with proper categorization."""
    
    # Get all accounts
    accounts = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).all()
    
    # Calculate cash balance
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),
        Transaction.user_id == user_id
    ).scalar() or 0
    
    # Categorize accounts properly
    assets = 0
    liabilities = 0
    
    for account in accounts:
        balance = account.current_balance or 0
        
        if account.type in ['depository', 'investment']:
            # Assets: checking, savings, investment accounts
            assets += balance
        elif account.type in ['credit', 'loan']:
            # Liabilities: credit cards, loans, mortgages
            liabilities += abs(balance)  # Ensure positive for liability calculation
        else:
            # Default to assets for unknown types
            assets += balance
    
    # Add cash to assets
    assets += cash_balance
    
    net_worth = assets - liabilities
    
    return {
        "total_assets": assets,
        "total_liabilities": liabilities,
        "net_worth": net_worth,
        "cash_balance": cash_balance
    }

def get_account_growth_data(
    db: Session, 
    user_id: int, 
    account_id: str, 
    days: int = 30
) -> Dict[str, Optional[float]]:
    """Get account balance growth over specified period."""
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Get current balance
    current_balance = None
    if account_id is None:
        # Cash account
        current_balance = db.query(func.sum(Transaction.amount)).filter(
            Transaction.account_id.is_(None),
            Transaction.user_id == user_id
        ).scalar() or 0
    else:
        # Regular account
        account = db.query(Account).filter(
            Account.account_id == account_id,
            Account.user_id == user_id
        ).first()
        current_balance = account.current_balance if account else 0
    
    # Get historical balance
    historical_balance = db.query(AccountBalanceHistory.current_balance).filter(
        AccountBalanceHistory.user_id == user_id,
        AccountBalanceHistory.account_id == account_id,
        AccountBalanceHistory.snapshot_date >= start_date,
        AccountBalanceHistory.snapshot_date <= end_date
    ).order_by(AccountBalanceHistory.snapshot_date.desc()).first()
    
    if not historical_balance or current_balance is None:
        return {
            "balance_change": None,
            "growth_percentage": None,
            "current_balance": current_balance,
            "historical_balance": None
        }
    
    historical_balance = historical_balance[0]
    balance_change = current_balance - historical_balance
    
    # Calculate growth percentage
    if historical_balance != 0:
        growth_percentage = (balance_change / abs(historical_balance)) * 100
    else:
        growth_percentage = 0 if current_balance == 0 else 100
    
    return {
        "balance_change": balance_change,
        "growth_percentage": growth_percentage,
        "current_balance": current_balance,
        "historical_balance": historical_balance
    }

def calculate_account_health_indicators(
    db: Session, 
    user_id: int, 
    account: Account
) -> Dict[str, Optional[float]]:
    """Calculate account health indicators like utilization rate."""
    
    indicators = {}
    
    # Calculate utilization rate for credit cards
    if account.type == 'credit' and account.limit and account.limit > 0:
        current_balance = abs(account.current_balance or 0)
        utilization_rate = (current_balance / account.limit) * 100
        indicators['utilization_rate'] = utilization_rate
    
    # Calculate days since last transaction
    last_transaction = db.query(Transaction.date).filter(
        Transaction.account_id == account.account_id,
        Transaction.user_id == user_id
    ).order_by(Transaction.date.desc()).first()
    
    if last_transaction:
        days_since = (date.today() - last_transaction[0]).days
        indicators['days_since_last_transaction'] = days_since
    
    return indicators

def get_account_percentage_contributions(
    db: Session, 
    user_id: int, 
    account_balance: float, 
    account_type: str
) -> Dict[str, float]:
    """Calculate what percentage of total assets/liabilities this account represents."""
    
    financial_impact = calculate_account_financial_impact(db, user_id)
    
    percentages = {}
    
    if account_type in ['depository', 'investment', 'cash']:
        # Asset account
        if financial_impact['total_assets'] > 0:
            percentages['percentage_of_total_assets'] = (account_balance / financial_impact['total_assets']) * 100
        else:
            percentages['percentage_of_total_assets'] = 0
    elif account_type in ['credit', 'loan']:
        # Liability account
        if financial_impact['total_liabilities'] > 0:
            percentages['percentage_of_total_liabilities'] = (account_balance / financial_impact['total_liabilities']) * 100
        else:
            percentages['percentage_of_total_liabilities'] = 0
    
    return percentages

# -------------------------------------------------------- Account Analysis.

def analyze_account_portfolio(
    db: Session, 
    user_id: int
) -> Dict[str, any]:
    """Analyze the user's account portfolio for insights."""
    
    # Get all accounts with enhanced data
    accounts = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).all()
    
    # Calculate financial impact
    financial_impact = calculate_account_financial_impact(db, user_id)
    
    # Analyze account distribution
    account_analysis = {
        "total_accounts": len(accounts),
        "account_types": {},
        "largest_accounts": [],
        "highest_growth_accounts": [],
        "risk_indicators": []
    }
    
    # Group by account type
    for account in accounts:
        account_type = account.type
        if account_type not in account_analysis["account_types"]:
            account_analysis["account_types"][account_type] = {
                "count": 0,
                "total_balance": 0,
                "accounts": []
            }
        
        account_analysis["account_types"][account_type]["count"] += 1
        account_analysis["account_types"][account_type]["total_balance"] += account.current_balance or 0
        account_analysis["account_types"][account_type]["accounts"].append({
            "name": account.name,
            "balance": account.current_balance,
            "subtype": account.subtype
        })
    
    # Add cash account
    cash_balance = financial_impact["cash_balance"]
    if cash_balance != 0:
        if "cash" not in account_analysis["account_types"]:
            account_analysis["account_types"]["cash"] = {
                "count": 1,
                "total_balance": cash_balance,
                "accounts": [{"name": "Cash", "balance": cash_balance, "subtype": "cash"}]
            }
    
    return account_analysis 