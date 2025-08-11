# Account Utils.
#
# Functions :
#   - 'create_account_balance_snapshot' - Create Balance Snapshots For All User Accounts.
#   - 'calculate_account_financial_impact' - Calculate Total Assets, Liabilities, And Net Worth With Proper Categorization.
#   - 'get_account_growth_data' - Get Account Balance Growth Over Specified Period.
#   - 'calculate_account_health_indicators' - Calculate Account Health Indicators Like Utilization Rate.
#   - 'get_account_percentage_contributions' - Calculate What Percentage Of Total Assets/Liabilities This Account Represents.
#   - 'analyze_account_portfolio' - Analyze The User's Account Portfolio For Insights.

# Imports.
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Dict, List, Optional

# Local Imports.
from ..database import Account, AccountBalanceHistory, Transaction

# -------------------------------------------------------- Account Balance Tracking.
def create_account_balance_snapshot(
    db: Session, 
    user_id: int, 
    snapshot_date: date = None
) -> List[AccountBalanceHistory]:
    """Create Balance Snapshots For All User Accounts."""
    
    if snapshot_date is None:
        snapshot_date = date.today()
    
    # Get All Active Accounts For The User.
    accounts = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).all()
    
    snapshots = []
    
    # Create Snapshots For Each Account.
    for account in accounts:
        # Check If Snapshot Already Exists For This Date.
        existing = db.query(AccountBalanceHistory).filter(
            AccountBalanceHistory.user_id == user_id,
            AccountBalanceHistory.account_id == account.account_id,
            AccountBalanceHistory.snapshot_date == snapshot_date
        ).first()
        
        if existing:
            # Update Existing Snapshot.
            existing.current_balance = account.current_balance
            existing.available_balance = account.available_balance
            existing.limit = account.limit
            existing.account_name = account.name
            existing.account_type = account.type
            existing.account_subtype = account.subtype
            existing.currency = account.currency
        else:
            # Create New Snapshot.
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
    
    # Handle Cash Account (Transactions With Account_Id = None).
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),
        Transaction.user_id == user_id
    ).scalar() or 0
    
    if cash_balance != 0:
        # Check If Cash Snapshot Already Exists.
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
    
    # Add Snapshots To Database.
    if snapshots:
        db.add_all(snapshots)
        db.commit()
    
    return snapshots

# -------------------------------------------------------- Enhanced Financial Calculations.
def calculate_account_financial_impact(
    db: Session, 
    user_id: int
) -> Dict[str, float]:
    """Calculate Total Assets, Liabilities, And Net Worth With Proper Categorization."""
    
    # Get All Accounts.
    accounts = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).all()
    
    # Calculate Cash Balance.
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),
        Transaction.user_id == user_id
    ).scalar() or 0
    
    # Categorize Accounts Properly.
    assets = 0
    liabilities = 0
    
    for account in accounts:
        balance = account.current_balance or 0
        
        if account.type in ['depository', 'investment']:
            # Assets: Checking, Savings, Investment Accounts.
            assets += balance
        elif account.type in ['credit', 'loan']:
            # Liabilities: Credit Cards, Loans, Mortgages.
            liabilities += abs(balance)  # Ensure Positive For Liability Calculation.
        else:
            # Default To Assets For Unknown Types.
            assets += balance
    
    # Add Cash To Assets.
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
    
    # Get Current Balance.
    current_balance = None
    if account_id is None:
        # Cash Account.
        current_balance = db.query(func.sum(Transaction.amount)).filter(
            Transaction.account_id.is_(None),
            Transaction.user_id == user_id
        ).scalar() or 0
    else:
        # Regular Account.
        account = db.query(Account).filter(
            Account.account_id == account_id,
            Account.user_id == user_id
        ).first()
        current_balance = account.current_balance if account else 0
    
    # Get Historical Balance.
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
    
    # Calculate Growth Percentage.
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
    """Calculate Account Health Indicators Like Utilization Rate."""
    
    indicators = {}
    
    # Calculate Utilization Rate For Credit Cards.
    if account.type == 'credit' and account.limit and account.limit > 0:
        current_balance = abs(account.current_balance or 0)
        utilization_rate = (current_balance / account.limit) * 100
        indicators['utilization_rate'] = utilization_rate
    
    # Calculate Days Since Last Transaction.
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
    """Calculate What Percentage Of Total Assets/Liabilities This Account Represents."""
    
    # Calculate Financial Impact.
    financial_impact = calculate_account_financial_impact(db, user_id)
    
    percentages = {}
    
    if account_type in ['depository', 'investment', 'cash']:
        # Asset Account.
        if financial_impact['total_assets'] > 0:
            percentages['percentage_of_total_assets'] = (account_balance / financial_impact['total_assets']) * 100
        else:
            percentages['percentage_of_total_assets'] = 0
    elif account_type in ['credit', 'loan']:
        # Liability Account.
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
    """Analyze The User's Account Portfolio For Insights."""
    
    # Get All Accounts With Enhanced Data.
    accounts = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).all()
    
    # Calculate Financial Impact.
    financial_impact = calculate_account_financial_impact(db, user_id)
    
    # Analyze Account Distribution.
    account_analysis = {
        "total_accounts": len(accounts),
        "account_types": {},
        "largest_accounts": [],
        "highest_growth_accounts": [],
        "risk_indicators": []
    }
    
    # Group By Account Type.
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
    
    # Add Cash Account.
    cash_balance = financial_impact["cash_balance"]
    if cash_balance != 0:
        if "cash" not in account_analysis["account_types"]:
            account_analysis["account_types"]["cash"] = {
                "count": 1,
                "total_balance": cash_balance,
                "accounts": [{"name": "Cash", "balance": cash_balance, "subtype": "cash"}]
            }
    
    return account_analysis 