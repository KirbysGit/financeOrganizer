# Transaction Routes.
#
# Note : During API Doc Dev, I'm probably going to clear out a lot of these, but for now just leaving it.
#        Also, need to probably modularize a lot of these, like need tags, stats, accounts, etc.
#
# Router : Prefix w/ "/transactions" & Tag w/ "Transactions".
#
# API Endpoints :
#   - 'get_transactions' - Get All Transactions For The Current User.
#   - 'get_detailed_transactions' - Get All Transactions With Account Info For The Current User.
#   - 'get_accounts' - Get All Accounts For The Current User.
#   - 'get_enhanced_accounts' - Get Accounts With Enhanced Data Including Growth, Financial Impact, And Health Indicators.
#   - 'get_account_analysis' - Get Comprehensive Analysis Of The User's Account Portfolio.
#   - 'create_snapshot' - Create A Balance Snapshot For All User Accounts.
#   - 'clear_database' - Clear The Database.
#   - 'create_transaction' - Create A New Transaction.
#   - 'recalculate_account_balances' - Recalculate The Balances For All Accounts.
#   - 'bulk_delete_transactions' - Bulk Delete Transactions.
#   - 'delete_transaction' - Delete A Specific Transaction.
#   - 'debug_account_balance' - Debug Account Balance.
#   - 'fix_account_balance' - Fix Account Balance.
#   - 'recalculate_all_account_balances' - Recalculate All Account Balances.
#   - 'get_stats' - Get Statistics For The Current User.
#   - 'update_transaction_details' - Update Transaction Details.
#   - 'debug_cash_flow' - Debug Cash Flow.
#   - 'get_tags' - Get All Tags For The Current User.
#   - 'create_tag' - Create A New Tag For The Current User.
#   - 'update_tag' - Update An Existing Tag.
#   - 'delete_tag' - Delete A Tag And Remove All Associations.
#   - 'add_tag_to_transaction' - Add A Tag To A Transaction.
#   - 'remove_tag_from_transaction' - Remove A Tag From A Transaction.
#   - 'get_transaction_tags' - Get All Tags For A Specific Transaction.
#   - 'get_tag_transaction_count' - Get The Number Of Transactions Associated With A Tag.
#   - 'initialize_default_tags' - Initialize Default Tags For The Current User.

# Imports.
from sqlalchemy import func, text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException

# Local Imports.
from app.database import Transaction, FileUpload, Account, Institution, User, MonthlySnapshot, AccountBalanceHistory, Tag, TransactionTag

# Local Utils.
from app.utils.auth_utils import get_current_user
from app.utils.tag_utils import create_default_tags
from app.utils.db_utils import get_db, check_db_connection
from app.utils.type_label_map import NEGATIVE_TYPES, POSITIVE_TYPES
from app.utils.snapshot_utils import (create_monthly_snapshot, get_previous_month_snapshot, get_growth_context)
from app.utils.account_utils import (
    create_account_balance_snapshot, 
    calculate_account_financial_impact,
    get_account_growth_data,
    calculate_account_health_indicators,
    get_account_percentage_contributions,
    analyze_account_portfolio
)

# Local Models.
from app.models import TransactionOut, TransactionCreate, AccountWithGrowth, TagCreate, TagOut

# Create Router Instance.
router = APIRouter(tags=["Transactions"])

# -------------------------------------------------------- Get All Transactions.
@router.get("/transactions", response_model=list[TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get All Transactions For The Current User."""
    
    # Check Database Connection.
    db = check_db_connection(db)
    
    # Query For All Transactions With Account And Institution Details For This User.
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).join(
        Account, Transaction.account_id == Account.account_id, isouter=True
    ).join(
        Institution, Account.item_id == Institution.item_id, isouter=True
    ).all()
    
    # Create Result List With Enhanced Details.
    result = []
    for tx in transactions:
        # Get Account Details.
        account_details = None
        if tx.account:
            account_details = {
                "id": tx.account.id,
                "account_id": tx.account.account_id,
                "name": tx.account.name,
                "official_name": tx.account.official_name,
                "type": tx.account.type,
                "subtype": tx.account.subtype,
                "mask": tx.account.mask,
                "current_balance": tx.account.current_balance,
                "available_balance": tx.account.available_balance,
                "limit": tx.account.limit,
                "currency": tx.account.currency,
                "is_active": tx.account.is_active
            }
        elif tx.account_id is None:
            # Handle Cash Transactions.
            account_details = {
                "id": None,
                "account_id": None,
                "name": "Cash",
                "official_name": "Cash Transaction",
                "type": "cash",
                "subtype": "cash",
                "mask": None,
                "current_balance": None,
                "available_balance": None,
                "limit": None,
                "currency": "USD",
                "is_active": True
            }
        
        # Get Institution Details.
        institution_details = None
        if tx.account and tx.account.item_id:
            # Query For Institution Using Item ID (Must Belong To Current User).
            institution = db.query(Institution).filter(
                Institution.item_id == tx.account.item_id,
                Institution.user_id == current_user.id
            ).first()
            
            # If Institution Found, Return Institution Details.
            if institution:
                institution_details = {
                    "id": institution.id,
                    "institution_id": institution.institution_id,
                    "name": institution.name,
                    "item_id": institution.item_id,
                    "is_connected": institution.is_connected,
                    "last_sync": institution.last_sync
                }
        
        # Get Tags For This Transaction.
        transaction_tags = db.query(Tag).join(TransactionTag).filter(
            TransactionTag.transaction_id == tx.id,
            Tag.user_id == current_user.id
        ).all()
        
        tags_list = []
        for tag in transaction_tags:
            tags_list.append({
                "id": tag.id,
                "name": tag.name,
                "emoji": tag.emoji,
                "color": tag.color
            })
        
        # Create Transaction Dict With Enhanced Fields.
        tx_dict = {
            "id": tx.id,
            "transaction_id": tx.transaction_id,
            "account_id": tx.account_id,
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
            "iso_currency_code": tx.iso_currency_code,
            "location_address": tx.location_address,
            "location_city": tx.location_city,
            "location_state": tx.location_state,
            "location_country": tx.location_country,
            "payment_reference": tx.payment_reference,
            "payment_method": tx.payment_method,
            "created_at": tx.created_at,
            "updated_at": tx.updated_at,
            "notes": tx.notes,
            "is_duplicate": tx.is_duplicate if hasattr(tx, 'is_duplicate') else False,
            "duplicate_count": tx.duplicate_count if hasattr(tx, 'duplicate_count') else 0,
            "last_updated": tx.last_updated if hasattr(tx, 'last_updated') else None,
            "account_details": account_details,
            "institution_details": institution_details,
            "tags": tags_list
        }
        
        result.append(tx_dict)
    
    return result

# ----------------------------------------------------------------------- Get Transactions with Account Info.
@router.get("/transactions/detailed")
def get_detailed_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query For All Transactions For This User, And Join With Account Info.
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).join(Account, Transaction.account_id == Account.account_id, isouter=True).all()
    
    # Create Result List.
    result = []
    for tx in transactions:
        # Handle Account Details For Cash Transactions.
        account_info = None
        if tx.account:
            account_info = {
                "name": tx.account.name,
                "type": tx.account.type,
                "subtype": tx.account.subtype,
                "mask": tx.account.mask
            }
        elif tx.account_id is None:
            # Handle cash transactions
            account_info = {
                "name": "Cash",
                "type": "cash",
                "subtype": "cash",
                "mask": None
            }
        
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
            "account": account_info
        }

        # Add Transaction To Result List.
        result.append(tx_dict)
    
    # Return Result List.
    return result

# ----------------------------------------------------------------------- Get All Accounts.
@router.get("/accounts")
def get_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check Database Connection.
    db = check_db_connection(db)
    
    # Query For All Accounts For This User, And Filter For Only Active Accounts.
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_active == True
    ).all()
    
    # Create Result List.
    result = []
    for account in accounts:
        # Count Transactions For This Account (Must Belong To Current User).
        tx_count = db.query(Transaction).filter(
            Transaction.account_id == account.account_id,
            Transaction.user_id == current_user.id
        ).count()
        
        # Create Account Dictionary.
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

        # Add Account To Result List.
        result.append(account_dict)
    
    # Add Cash Account If User Has Cash Transactions.
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),  # Cash Transactions Have Account ID = None.
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    if cash_balance != 0:  # Only Add Cash Account If There Are Cash Transactions.
        cash_tx_count = db.query(Transaction).filter(
            Transaction.account_id.is_(None),
            Transaction.user_id == current_user.id
        ).count()
        
        cash_account = {
            "id": None,
            "account_id": None,
            "name": "Cash",
            "official_name": "Cash Balance",
            "type": "cash",
            "subtype": "cash",
            "mask": None,
            "current_balance": cash_balance,
            "available_balance": cash_balance,
            "currency": "USD",
            "transaction_count": cash_tx_count,
            "updated_at": datetime.now()
        }
        
        result.append(cash_account)
    
    # Return Result List.
    return result

# ----------------------------------------------------------------------- Get Enhanced Accounts with Growth Data.
@router.get("/accounts/enhanced", response_model=list[AccountWithGrowth])
def get_enhanced_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Accounts With Enhanced Data Including Growth, Financial Impact, And Health Indicators."""
    
    # Check Database Connection.
    db = check_db_connection(db)
    
    # Create Balance Snapshot For Today.
    create_account_balance_snapshot(db, current_user.id)
    
    # Get All Accounts.
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_active == True
    ).all()
    
    # Calculate Financial Impact For Percentages.
    financial_impact = calculate_account_financial_impact(db, current_user.id)
    
    # Create Result List.
    result = []
    
    # Per Account,
    for account in accounts:
        # Get Transaction Count.
        tx_count = db.query(Transaction).filter(
            Transaction.account_id == account.account_id,
            Transaction.user_id == current_user.id
        ).count()
        
        # Get Growth Data.
        growth_30d = get_account_growth_data(db, current_user.id, account.account_id, 30)
        growth_90d = get_account_growth_data(db, current_user.id, account.account_id, 90)
        growth_1y = get_account_growth_data(db, current_user.id, account.account_id, 365)
        
        # Get Health Indicators.
        health_indicators = calculate_account_health_indicators(db, current_user.id, account)
        
        # Calculate Financial Impact.
        balance = account.current_balance or 0
        if account.type in ['depository', 'investment']:
            asset_contribution = balance
            liability_contribution = 0
            net_worth_contribution = balance
        elif account.type in ['credit', 'loan']:
            asset_contribution = 0
            liability_contribution = abs(balance)
            net_worth_contribution = -abs(balance)
        else:
            asset_contribution = balance
            liability_contribution = 0
            net_worth_contribution = balance
        
        # Get Percentage Contributions.
        percentages = get_account_percentage_contributions(db, current_user.id, balance, account.type)
        
        account_dict = {
            "id": account.id,
            "account_id": account.account_id,
            "name": account.name,
            "official_name": account.official_name,
            "type": account.type,
            "subtype": account.subtype,
            "mask": account.mask,
            "current_balance": balance,
            "available_balance": account.available_balance,
            "limit": account.limit,
            "currency": account.currency,
            "transaction_count": tx_count,
            "updated_at": account.updated_at,
            
            # Growth Data.
            "balance_change_30d": growth_30d["balance_change"],
            "balance_change_90d": growth_90d["balance_change"],
            "balance_change_1y": growth_1y["balance_change"],
            "growth_percentage_30d": growth_30d["growth_percentage"],
            "growth_percentage_90d": growth_90d["growth_percentage"],
            "growth_percentage_1y": growth_1y["growth_percentage"],
            
            # Financial Impact.
            "net_worth_contribution": net_worth_contribution,
            "asset_contribution": asset_contribution,
            "liability_contribution": liability_contribution,
            "percentage_of_total_assets": percentages.get("percentage_of_total_assets"),
            "percentage_of_total_liabilities": percentages.get("percentage_of_total_liabilities"),
            
            # Health Indicators.
            "utilization_rate": health_indicators.get("utilization_rate"),
            "days_since_last_transaction": health_indicators.get("days_since_last_transaction")
        }
        
        result.append(account_dict)
    
    # Add Cash Account If User Has Cash Transactions.
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    if cash_balance != 0:
        cash_tx_count = db.query(Transaction).filter(
            Transaction.account_id.is_(None),
            Transaction.user_id == current_user.id
        ).count()
        
        # Get Cash Growth Data.
        cash_growth_30d = get_account_growth_data(db, current_user.id, None, 30)
        cash_growth_90d = get_account_growth_data(db, current_user.id, None, 90)
        cash_growth_1y = get_account_growth_data(db, current_user.id, None, 365)
        
        # Get Cash Percentages.
        cash_percentages = get_account_percentage_contributions(db, current_user.id, cash_balance, "cash")
        
        cash_account = {
            "id": None,
            "account_id": None,
            "name": "Cash",
            "official_name": "Cash Balance",
            "type": "cash",
            "subtype": "cash",
            "mask": None,
            "current_balance": cash_balance,
            "available_balance": cash_balance,
            "limit": None,
            "currency": "USD",
            "transaction_count": cash_tx_count,
            "updated_at": datetime.now(),
            
            # Growth Data.
            "balance_change_30d": cash_growth_30d["balance_change"],
            "balance_change_90d": cash_growth_90d["balance_change"],
            "balance_change_1y": cash_growth_1y["balance_change"],
            "growth_percentage_30d": cash_growth_30d["growth_percentage"],
            "growth_percentage_90d": cash_growth_90d["growth_percentage"],
            "growth_percentage_1y": cash_growth_1y["growth_percentage"],
            
            # Financial Impact.
            "net_worth_contribution": cash_balance,
            "asset_contribution": cash_balance,
            "liability_contribution": 0,
            "percentage_of_total_assets": cash_percentages.get("percentage_of_total_assets"),
            "percentage_of_total_liabilities": None,
            
            # Health Indicators.
            "utilization_rate": None,
            "days_since_last_transaction": None
        }
        
        result.append(cash_account)
    
    return result

# ----------------------------------------------------------------------- Get Account Portfolio Analysis.
@router.get("/accounts/analysis")
def get_account_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Comprehensive Analysis Of The User's Account Portfolio."""
    
    # Create Balance Snapshot.
    create_account_balance_snapshot(db, current_user.id)
    
    # Get Portfolio Analysis.
    portfolio_analysis = analyze_account_portfolio(db, current_user.id)
    
    # Get Financial Impact.
    financial_impact = calculate_account_financial_impact(db, current_user.id)
    
    # Add Financial Summary.
    portfolio_analysis["financial_summary"] = financial_impact
    
    return portfolio_analysis

# ----------------------------------------------------------------------- Create Account Balance Snapshot.
@router.post("/accounts/snapshot")
def create_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create A Balance Snapshot For All User Accounts."""
    
    snapshots = create_account_balance_snapshot(db, current_user.id)
    
    return {
        "message": f"Created {len(snapshots)} account balance snapshots",
        "snapshot_date": date.today().isoformat(),
        "snapshots_created": len(snapshots)
    }

# ----------------------------------------------------------------------- Clears Entire Database For Current User.
@router.delete("/clear")
def clear_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear The Database For The Current User."""
    
    try:
        # Disable Foreign Key Checks Temporarily.
        if "sqlite" in str(db.bind.url):
            db.execute(text("PRAGMA foreign_keys = OFF"))
        else:
            db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        # Clear All Tables For Current User (In Order Of Dependencies).
        db.query(Transaction).filter(Transaction.user_id == current_user.id).delete()
        db.query(FileUpload).filter(FileUpload.user_id == current_user.id).delete()
        db.query(Account).filter(Account.user_id == current_user.id).delete()
        db.query(Institution).filter(Institution.user_id == current_user.id).delete()
        
        # Re-enable Foreign Key Checks.
        if "sqlite" in str(db.bind.url):
            db.execute(text("PRAGMA foreign_keys = ON"))
        else:
            db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        
        # Commit Changes.
        db.commit()
        
        # Verify Tables Are Empty For Current User.
        transaction_count = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()
        file_count = db.query(FileUpload).filter(FileUpload.user_id == current_user.id).count()
        account_count = db.query(Account).filter(Account.user_id == current_user.id).count()
        institution_count = db.query(Institution).filter(Institution.user_id == current_user.id).count()
        
        # Return Success Msg With Verification.
        return {
            "message": "Your data has been cleared successfully",
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
        
        # Re-enable Foreign Key Checks In Case Of Error.
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
def create_transaction(
    transaction: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually Add A New Transaction."""
    
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

    # Handle Account Selection.
    selected_account = None
    account_data = tx_data.get("account_data")

    # If Account Data Is Provided, Handle Account Selection.
    
    if account_data:
        if account_data.get('type') == 'cash':
            # Cash Transactions Don't Need An Account.
            selected_account = None
        elif account_data.get('is_new'):
            # Create New Manual Account.
            selected_account = Account(
                user_id=current_user.id,
                account_id=account_data['account_id'],
                name=account_data['name'],
                official_name=account_data['name'],
                type=account_data['type'],
                subtype=account_data['subtype'],
                current_balance=0,
                available_balance=0,
                is_active=True,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(selected_account)
            db.commit()
            db.refresh(selected_account)
        else:
            # Use Existing Account (Must Belong To Current User).
            selected_account = db.query(Account).filter_by(
                account_id=account_data['account_id'],
                user_id=current_user.id
            ).first()
            
            if not selected_account:
                raise HTTPException(status_code=400, detail="Selected account not found or doesn't belong to you")

    # Map Old Field Names To New Schema.
    new_tx_data = {
        "user_id": current_user.id,
        "date": tx_data.get("date"),
        "amount": tx_data.get("amount"),
        "vendor": tx_data.get("vendor"),
        "description": tx_data.get("description"),
        "category_primary": tx_data.get("type", "other"),
        "source": "manual",
        "file": "manual",
        "created_at": tx_data.get("created_at"),
        "updated_at": tx_data.get("updated_at")
    }

    # Add Account Info If Not Cash Transaction.
    if selected_account:
        new_tx_data['account_id'] = selected_account.account_id
    else:
        # Cash Transaction - No Account ID.
        new_tx_data['account_id'] = None

    # Create New Transaction.
    new_tx = Transaction(**new_tx_data)
    
    # Add, Commit, And Refresh Database.
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    # Handle Tags If Provided.
    tag_ids = tx_data.get("tag_ids", [])
    if tag_ids:
        for tag_id in tag_ids:
            # Verify Tag Belongs To Current User.
            tag = db.query(Tag).filter(
                Tag.id == tag_id,
                Tag.user_id == current_user.id
            ).first()
            
            if tag:
                # Create Transaction-Tag Relationship.
                transaction_tag = TransactionTag(
                    transaction_id=new_tx.id,
                    tag_id=tag_id
                )
                db.add(transaction_tag)
        
        db.commit()

    # Recalculate Account Balance If Not Cash Transaction.
    if selected_account:
        updated_accounts = recalculate_account_balances(db, current_user.id, [selected_account.account_id])
        print(f"Updated balance for account {selected_account.account_id} after transaction creation")

    # Return New Transaction.
    return new_tx

# ----------------------------------------------------------------------- Helper function to recalculate account balances.
def recalculate_account_balances(db: Session, user_id: int, affected_account_ids: list = None):
    """
    Recalculate Account Balances Based On Current Transactions.
    If Affected Account IDs Is Provided, Only Recalculate Those Accounts.
    If None, Recalculate All Accounts For The User.
    """
    if affected_account_ids:
        # Only Recalculate Specific Accounts.
        accounts_to_update = db.query(Account).filter(
            Account.user_id == user_id,
            Account.account_id.in_(affected_account_ids),
            Account.is_active == True
        ).all()
    else:
        # Recalculate All Accounts.
        accounts_to_update = db.query(Account).filter(
            Account.user_id == user_id,
            Account.is_active == True
        ).all()
    
    for account in accounts_to_update:
        # Calculate New Balance Based On Remaining Transactions.
        total_balance = db.query(func.sum(Transaction.amount)).filter(
            Transaction.account_id == account.account_id,
            Transaction.user_id == user_id
        ).scalar() or 0
        
        # Update Account Balance.
        account.current_balance = total_balance
        account.available_balance = total_balance  # For Simplicity, Assume Available = Current.
        account.updated_at = datetime.now()
    
    return accounts_to_update

# ----------------------------------------------------------------------- Bulk Delete Transactions.
@router.delete("/transactions/bulk")
def bulk_delete_transactions(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk Delete Transactions."""
    
    transaction_ids = request.get("transaction_ids", [])
    
    if not transaction_ids:
        return {"error": "No transaction IDs provided"}
    
    # Find All Transactions That Belong To The Current User.
    transactions = db.query(Transaction).filter(
        Transaction.id.in_(transaction_ids),
        Transaction.user_id == current_user.id
    ).all()
    
    if not transactions:
        return {"error": "No transactions found"}
    
    # Collect Affected Account IDs For Balance Recalculation.
    affected_account_ids = set()
    for transaction in transactions:
        if transaction.account_id:  # Skip Cash Transactions (Account ID = None).
            affected_account_ids.add(transaction.account_id)
    
    deleted_count = len(transactions)
    
    # Delete All Found Transactions.
    for transaction in transactions:
        db.delete(transaction)
    
    # Recalculate Balances For Affected Accounts.
    if affected_account_ids:
        updated_accounts = recalculate_account_balances(db, current_user.id, list(affected_account_ids))
        print(f"Updated balances for {len(updated_accounts)} accounts after bulk delete")
    
    # Commit To Database.
    db.commit()
    
    # Return Success Message.
    return {
        "message": f"Successfully deleted {deleted_count} transaction{'s' if deleted_count != 1 else ''}",
        "deleted_count": deleted_count,
        "updated_accounts": len(affected_account_ids) if affected_account_ids else 0
    }

# ----------------------------------------------------------------------- Delete Individual Transaction.
@router.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete A Specific Transaction."""
    
    # Find Transaction By ID (Must Belong To Current User).
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        return {"error": "Transaction not found"}
    
    # Store Account ID For Balance Recalculation.
    affected_account_id = transaction.account_id
    
    # Delete Transaction.
    db.delete(transaction)
    
    # Recalculate Balance For Affected Account (If Not Cash Transaction).
    if affected_account_id:
        updated_accounts = recalculate_account_balances(db, current_user.id, [affected_account_id])
        print(f"Updated balance for account {affected_account_id} after transaction delete")

    # Commit To Database.
    db.commit()
    
    # Return Success Message.
    return {"message": f"Transaction {transaction_id} deleted successfully"}

# ----------------------------------------------------------------------- Debug Account Balance Calculation.
@router.get("/debug/account/{account_id}")
def debug_account_balance(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Debug Endpoint To Check Account Balance Calculation."""
    
    # Get The Account.
    account = db.query(Account).filter(
        Account.account_id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get All Transactions For This Account.
    transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id,
        Transaction.user_id == current_user.id
    ).all()
    
    # Calculate Balance Manually.
    manual_balance = sum(tx.amount for tx in transactions)
    
    # Calculate Balance Using The Query.
    query_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id == account_id,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    return {
        "account_info": {
            "account_id": account.account_id,
            "name": account.name,
            "type": account.type,
            "current_balance": account.current_balance,
            "is_active": account.is_active
        },
        "transaction_count": len(transactions),
        "transactions": [
            {
                "id": tx.id,
                "amount": tx.amount,
                "date": tx.date.isoformat() if tx.date else None,
                "vendor": tx.vendor,
                "account_id": tx.account_id
            } for tx in transactions
        ],
        "balance_calculation": {
            "manual_sum": manual_balance,
            "query_result": query_balance,
            "account_current_balance": account.current_balance
        }
    }

# ----------------------------------------------------------------------- Fix Specific Account Balance.
@router.post("/accounts/{account_id}/fix-balance")
def fix_account_balance(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fix The Balance For A Specific Account."""
    
    # Get The Account.
    account = db.query(Account).filter(
        Account.account_id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Store Old Balance For Comparison.
    old_balance = account.current_balance
    
    # Recalculate Balance For This Specific Account.
    updated_accounts = recalculate_account_balances(db, current_user.id, [account_id])
    
    # Get The Updated Balance.
    db.refresh(account)
    new_balance = account.current_balance
    
    # Commit The Changes.
    db.commit()
    
    return {
        "message": f"Fixed balance for account {account_id}",
        "account_name": account.name,
        "account_type": account.type,
        "old_balance": old_balance,
        "new_balance": new_balance,
        "balance_change": new_balance - (old_balance or 0)
    }

# ----------------------------------------------------------------------- Manually Recalculate All Account Balances.
@router.post("/accounts/recalculate-balances")
def recalculate_all_account_balances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually Recalculate All Account Balances Based On Transactions."""
    
    try:
        # Get All Accounts For The User.
        accounts = db.query(Account).filter(
            Account.user_id == current_user.id,
            Account.is_active == True
        ).all()
        
        updated_accounts = recalculate_account_balances(db, current_user.id)
        
        # Get Updated Balances For Response.
        balance_summary = []
        for account in updated_accounts:
            balance_summary.append({
                "account_id": account.account_id,
                "name": account.name,
                "type": account.type,
                "old_balance": "N/A",  # We don't track the old value
                "new_balance": account.current_balance
            })
        
        db.commit()
        
        return {
            "message": f"Successfully recalculated balances for {len(updated_accounts)} accounts",
            "accounts_updated": len(updated_accounts),
            "balance_summary": balance_summary
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error recalculating account balances: {str(e)}"
        )

# ----------------------------------------------------------------------- Get Stats.
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Statistics For The Current User."""
    
    # Check Database Connection.
    db = check_db_connection(db)
    
    # Get Current Date & Calculate Time Periods.
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1).date()
    start_of_week = (now - timedelta(days=now.weekday())).date()
    start_of_year = datetime(now.year, 1, 1).date()
    
    # Calculate Previous Periods For Growth Comparison.

    # Previous Month.
    if now.month == 1:
        prev_month_start = datetime(now.year - 1, 12, 1).date()
        prev_month_end = datetime(now.year - 1, 12, 31).date()
    else:
        prev_month_start = datetime(now.year, now.month - 1, 1).date()
        prev_month_end = datetime(now.year, now.month, 1).date() - timedelta(days=1)
    
    # Previous Week.
    prev_week_start = start_of_week - timedelta(days=7)
    prev_week_end = start_of_week - timedelta(days=1)
    
    # Previous Year.
    prev_year_start = datetime(now.year - 1, 1, 1).date()
    prev_year_end = datetime(now.year - 1, 12, 31).date()

    # Get All Transactions For Current User.
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    # Total Income (All Time).
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Monthly Income (Current Month).
    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_month,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Previous Month Income.
    prev_monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= prev_month_start,
        Transaction.date <= prev_month_end,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Weekly Income (Current Week).
    weekly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_week,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Previous Week Income.
    prev_weekly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= prev_week_start,
        Transaction.date <= prev_week_end,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Year-to-Date Income.
    ytd_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_year,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Previous Year Income.
    prev_ytd_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= prev_year_start,
        Transaction.date <= prev_year_end,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Total Spending (All Time).
    total_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Monthly Spending (Current Month).
    monthly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_month,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Previous Month Spending.
    prev_monthly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= prev_month_start,
        Transaction.date <= prev_month_end,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Weekly Spending (Current Week).
    weekly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_week,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Previous Week Spending.
    prev_weekly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= prev_week_start,
        Transaction.date <= prev_week_end,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Year-to-Date Spending.
    ytd_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_year,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Previous Year Spending.
    prev_ytd_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= prev_year_start,
        Transaction.date <= prev_year_end,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Calculate Cash Flow.
    monthly_cash_flow = monthly_income + monthly_spending
    weekly_cash_flow = weekly_income + weekly_spending
    ytd_cash_flow = ytd_income + ytd_spending
    
    # Previous Period Cash Flows.
    prev_monthly_cash_flow = prev_monthly_income + prev_monthly_spending
    prev_weekly_cash_flow = prev_weekly_income + prev_weekly_spending
    prev_ytd_cash_flow = prev_ytd_income + prev_ytd_spending
    

    # -------------------------------------------------------- Calculate Growth Percentages.
    def calculate_growth_percentage(current, previous):
        # Handle Edge Cases More Gracefully.
        if previous == 0:
            if current == 0:
                return 0.0  # No Change.
            elif current > 0:
                return 0.0  # Can't Calculate Meaningful Growth From 0 To Positive.
            else:
                return 0.0  # Can't calculate meaningful growth from 0 to negative
        
        # Calculate Percentage Change.
        percentage_change = ((current - previous) / abs(previous)) * 100
        
        # Cap The Percentage To Reasonable Limits To Avoid Misleading Numbers.
        if percentage_change > 1000:  # More than 1000% growth
            return 100.0  # Cap at 100% to avoid misleading numbers
        elif percentage_change < -1000:  # More than 1000% decline
            return -100.0  # Cap at -100% to avoid misleading numbers
        
        return percentage_change
    
    # Growth Calculations For Income And Spending.
    # Only Calculate Growth If We Have Meaningful Data In Both Periods.
    def get_meaningful_growth(current, previous, min_threshold=10):
        # If We Don't Have Enough Data In Either Period, Return 0.
        if abs(current) < min_threshold and abs(previous) < min_threshold:
            return 0.0
        return calculate_growth_percentage(current, previous)
    
    income_growth = {
        "monthly": get_meaningful_growth(monthly_income, prev_monthly_income),
        "weekly": get_meaningful_growth(weekly_income, prev_weekly_income),
        "yearly": get_meaningful_growth(ytd_income, prev_ytd_income)
    }
    
    # Growth Calculations For Spending.
    spending_growth = {
        "monthly": get_meaningful_growth(monthly_spending, prev_monthly_spending),
        "weekly": get_meaningful_growth(weekly_spending, prev_weekly_spending),
        "yearly": get_meaningful_growth(ytd_spending, prev_ytd_spending)
    }
    
    # Growth Calculations For Cash Flow.
    cash_flow_growth = {
        "monthly": get_meaningful_growth(monthly_cash_flow, prev_monthly_cash_flow),
        "weekly": get_meaningful_growth(weekly_cash_flow, prev_weekly_cash_flow),
        "yearly": get_meaningful_growth(ytd_cash_flow, prev_ytd_cash_flow)
    }
    
    # Debug Logging For Growth Calculations.
    print(f"DEBUG - Monthly Cash Flow Growth:")
    print(f"  Current month: ${monthly_cash_flow}")
    print(f"  Previous month: ${prev_monthly_cash_flow}")
    print(f"  Growth percentage: {cash_flow_growth['monthly']}%")
    print(f"  Date ranges - Current: {start_of_month} to {now.date()}")
    print(f"  Date ranges - Previous: {prev_month_start} to {prev_month_end}")
    
    # Get Income By Category.
    income_by_category = db.query(
        Transaction.category_primary,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.amount > 0,
        Transaction.user_id == current_user.id
    ).group_by(
        Transaction.category_primary
    ).all()
    
    # Get Spending By Category (Top 5).
    spending_by_category = db.query(
        Transaction.category_primary,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.amount < 0,
        Transaction.user_id == current_user.id
    ).group_by(
        Transaction.category_primary
    ).order_by(
        func.sum(Transaction.amount).asc()
    ).limit(5).all()
    
    # Get Average Transaction Amounts.
    avg_income = db.query(func.avg(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    avg_spending = db.query(func.avg(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Get Transaction Frequency.
    transaction_count = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()
    income_count = db.query(Transaction).filter(
        Transaction.amount > 0,
        Transaction.user_id == current_user.id
    ).count()
    spending_count = db.query(Transaction).filter(
        Transaction.amount < 0,
        Transaction.user_id == current_user.id
    ).count()
    
    # Get Account Statistics For Current User.
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    
    # Calculate assets and liabilities properly
    total_assets = 0
    total_liabilities = 0
    
    for acc in accounts:
        balance = acc.current_balance or 0
        if acc.type in ['depository', 'investment']:
            # Assets: checking, savings, investment accounts
            total_assets += balance
        elif acc.type in ['credit', 'loan']:
            # Liabilities: credit cards, loans, mortgages
            total_liabilities += abs(balance)  # Ensure positive for liability calculation
        else:
            # Default to assets for unknown types
            total_assets += balance
    
    # Calculate Cash Balance From Cash Transactions.
    cash_balance = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.is_(None),  # Cash Transactions Have Account Id = None.
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    # Include Cash Balance In Total Assets And Net Worth.
    total_assets_with_cash = total_assets + cash_balance
    net_worth = total_assets_with_cash - total_liabilities
    
    # Helper Function To Get Account Totals By Type.
    def get_account_total_by_type(account_type):
        return sum(acc.current_balance for acc in accounts if acc.type == account_type)
    
    # For Now, We'll Use Simplified Liability Growth Based On Current Vs Previous Cash Flow.
    # In A Production System, You'd Want To Store Historical Account Balances.
    # For Liabilities, We'll Only Calculate Growth If There Are Actual Liabilities.
    current_liabilities = get_account_total_by_type('credit')
    
    # Simplified Approach: Always Show Growth Indicator, Even If 0%.
    # If There Are Liabilities, We'll Estimate Growth From Cash Flow Changes.
    # (This Is A Simplified Approach - Ideally You'd Track Historical Account Balances.)
    liabilities_growth = {
        "monthly": -calculate_growth_percentage(monthly_spending, prev_monthly_spending) or 0.0,
        "weekly": -calculate_growth_percentage(weekly_spending, prev_weekly_spending) or 0.0,
        "yearly": -calculate_growth_percentage(ytd_spending, prev_ytd_spending) or 0.0
    }
    
    # Net Worth Growth (Based On Cash Flow Changes).
    net_worth_growth = {
        "monthly": calculate_growth_percentage(monthly_cash_flow, prev_monthly_cash_flow),
        "weekly": calculate_growth_percentage(weekly_cash_flow, prev_weekly_cash_flow),
        "yearly": calculate_growth_percentage(ytd_cash_flow, prev_ytd_cash_flow)
    }
    
    # Assets Growth (Simplified - Based On Income Changes).
    assets_growth = {
        "monthly": calculate_growth_percentage(monthly_income, prev_monthly_income),
        "weekly": calculate_growth_percentage(weekly_income, prev_weekly_income),
        "yearly": calculate_growth_percentage(ytd_income, prev_ytd_income)
    }
    
    # Get Source Statistics For Current User.
    source_stats = {}
    for source in ['plaid', 'csv', 'manual']:
        source_transactions = db.query(Transaction).filter(
            Transaction.source == source,
            Transaction.user_id == current_user.id
        ).all()
        source_stats[source] = {
            'count': len(source_transactions),
            'total': sum(t.amount for t in source_transactions)
        }
    
    # Create Or Update Monthly Snapshot For Current Month.
    current_month_start = datetime(now.year, now.month, 1).date()
    current_snapshot = create_monthly_snapshot(
        db=db,
        user_id=current_user.id,
        snapshot_date=current_month_start,
        net_worth=net_worth,
        total_assets=total_assets_with_cash,
        total_liabilities=total_liabilities,
        monthly_cash_flow=monthly_cash_flow,
        monthly_income=monthly_income,
        monthly_spending=monthly_spending,
        transaction_count=transaction_count
    )
    
    # Get Previous Month's Snapshot For Comparison.
    previous_snapshot = get_previous_month_snapshot(db, current_user.id, now.date())
    
    # Get Growth Context From Snapshots.
    growth_context = get_growth_context(current_snapshot, previous_snapshot)
    
    # Return Stats With Snapshot-Based Growth.
    return {
        "totals": {
            "transactions": transaction_count,
            "accounts": len(accounts),
            "total_assets": total_assets_with_cash,
            "cash_balance": cash_balance,
            "total_liabilities": total_liabilities,
            "net_worth": net_worth,
            "average_income": avg_income,
            "average_spending": avg_spending,
            "growth": {
                "net_worth": growth_context["growth"]["net_worth"],
                "total_assets": growth_context["growth"]["total_assets"],
                "total_liabilities": growth_context["growth"]["total_liabilities"],
                "monthly_cash_flow": growth_context["growth"]["monthly_cash_flow"]
            }
        },
        "income": {
            "total": total_income,
            "this_month": monthly_income,
            "this_week": weekly_income,
            "year_to_date": ytd_income,
            "by_category": [{"category": cat, "amount": amt} for cat, amt in income_by_category],
            "growth": income_growth
        },
        "spending": {
            "total": total_spending,
            "this_month": monthly_spending,
            "this_week": weekly_spending,
            "year_to_date": ytd_spending,
            "by_category": [{"category": cat, "amount": amt} for cat, amt in spending_by_category],
            "growth": spending_growth
        },
        "cash_flow": {
            "this_month": monthly_cash_flow,
            "this_week": weekly_cash_flow,
            "year_to_date": ytd_cash_flow,
            "growth": cash_flow_growth
        },
        "accounts": {
            "by_type": {
                "depository": total_assets,
                "cash": cash_balance,
                "credit": total_liabilities,
                "loan": sum(acc.current_balance for acc in accounts if acc.type == 'loan'),
                "investment": sum(acc.current_balance for acc in accounts if acc.type == 'investment')
            },
            "total": len(accounts)
        },
        "sources": source_stats,
        "growth": {
            "net_worth": net_worth_growth,
            "assets": assets_growth,
            "liabilities": liabilities_growth
        },
        "snapshots": {
            "current_month": growth_context["current"],
            "previous_month": growth_context["previous"],
            "has_historical_data": growth_context["has_historical_data"]
        }
    }

# ----------------------------------------------------------------------- Update Existing Transactions With Account/Institution Details.
@router.post("/transactions/update-details")
def update_transaction_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update Existing Transactions With Account/Institution Details."""
    
    try:
        # Get All Transactions That Don't Have Account Details Populated For Current User.
        transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
        
        updated_count = 0
        
        for tx in transactions:
            # Get Account Details (Must Belong To Current User).
            account = db.query(Account).filter(
                Account.account_id == tx.account_id,
                Account.user_id == current_user.id
            ).first()
            
            if account:
                # Get Institution Details (Must Belong To Current User).
                institution = None
                if account.item_id:
                    institution = db.query(Institution).filter(
                        Institution.item_id == account.item_id,
                        Institution.user_id == current_user.id
                    ).first()
                
                # Update Transaction With Account And Institution Details.
                # Note: Since These Are Computed Fields In The Response, We Don't Need To Store Them In The Database.
                # They Will Be Populated When The Transaction Is Fetched.
                updated_count += 1
        
        return {
            "message": f"Found {updated_count} transactions with linked accounts",
            "total_transactions": len(transactions),
            "linked_transactions": updated_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating transaction details: {str(e)}"
        )

# ----------------------------------------------------------------------- Debug Cash Flow Calculations.
@router.get("/debug/cash-flow")
def debug_cash_flow(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Debug Endpoint To Check Cash Flow Calculations."""
    
    # Get Current Date & Calculate Time Periods.
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1).date()
    start_of_week = (now - timedelta(days=now.weekday())).date()
    
    # Get all transactions for current user
    all_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()
    
    # Get cash transactions
    cash_transactions = db.query(Transaction).filter(
        Transaction.account_id.is_(None),
        Transaction.user_id == current_user.id
    ).all()
    
    # Get monthly transactions
    monthly_transactions = db.query(Transaction).filter(
        Transaction.date >= start_of_month,
        Transaction.user_id == current_user.id
    ).all()
    
    # Get monthly cash transactions
    monthly_cash_transactions = db.query(Transaction).filter(
        Transaction.account_id.is_(None),
        Transaction.date >= start_of_month,
        Transaction.user_id == current_user.id
    ).all()
    
    # Get weekly transactions
    weekly_transactions = db.query(Transaction).filter(
        Transaction.date >= start_of_week,
        Transaction.user_id == current_user.id
    ).all()
    
    # Calculate monthly income and spending
    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount > 0,
        Transaction.date >= start_of_month,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    monthly_spending = db.query(func.sum(Transaction.amount)).filter(
        Transaction.amount < 0,
        Transaction.date >= start_of_month,
        Transaction.user_id == current_user.id
    ).scalar() or 0
    
    monthly_cash_flow = monthly_income + monthly_spending
    
    return {
        "debug_info": {
            "current_date": now.isoformat(),
            "start_of_month": start_of_month.isoformat(),
            "start_of_week": start_of_week.isoformat(),
            "total_transactions": len(all_transactions),
            "cash_transactions": len(cash_transactions),
            "monthly_transactions": len(monthly_transactions),
            "monthly_cash_transactions": len(monthly_cash_transactions),
            "weekly_transactions": len(weekly_transactions),
            "monthly_income": monthly_income,
            "monthly_spending": monthly_spending,
            "monthly_cash_flow": monthly_cash_flow,
            "recent_transaction_dates": [
                tx.date.isoformat() for tx in all_transactions[:10]  # Show first 10 transaction dates
            ],
            "cash_transaction_details": [
                {
                    "id": tx.id,
                    "date": tx.date.isoformat(),
                    "amount": tx.amount,
                    "vendor": tx.vendor,
                    "description": tx.description
                } for tx in monthly_cash_transactions
            ]
        }
    }

# ----------------------------------------------------------------------- Get All Tags For User.
@router.get("/tags", response_model=list[TagOut])
def get_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get All Tags For The Current User."""
    
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    return tags

# ----------------------------------------------------------------------- Create New Tag
@router.post("/tags", response_model=TagOut, status_code=201)
def create_tag(
    tag_data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create A New Tag For The Current User."""
    
    # Check If Tag Name Already Exists For This User.
    existing_tag = db.query(Tag).filter(
        Tag.user_id == current_user.id,
        Tag.name == tag_data.name
    ).first()
    
    # If Tag Name Already Exists, Raise Error.
    if existing_tag:
        raise HTTPException(
            status_code=400,
            detail=f"Tag '{tag_data.name}' already exists"
        )
    
    # Create New Tag Object.
    new_tag = Tag(
        user_id=current_user.id,
        name=tag_data.name,
        emoji=tag_data.emoji,
        color=tag_data.color,
        is_default=False
    )
    
    # Add New Tag To Database & Refresh.
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    
    # Return New Tag.
    return new_tag

# ----------------------------------------------------------------------- Update Tag
@router.put("/tags/{tag_id}", response_model=TagOut)
def update_tag(
    tag_id: int,
    tag_data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update An Existing Tag."""
    
    # Find Tag (Must Belong To Current User).
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check If New Name Conflicts With Existing Tag.
    if tag_data.name != tag.name:
        existing_tag = db.query(Tag).filter(
            Tag.user_id == current_user.id,
            Tag.name == tag_data.name,
            Tag.id != tag_id
        ).first()
        
        if existing_tag:
            raise HTTPException(
                status_code=400,
                detail=f"Tag '{tag_data.name}' already exists"
            )
    
    # Update Tag.
    tag.name = tag_data.name
    tag.emoji = tag_data.emoji
    tag.color = tag_data.color
    tag.updated_at = datetime.now()
    
    # Commit Changes & Refresh Tag.
    db.commit()
    db.refresh(tag)
    
    return tag

# ----------------------------------------------------------------------- Delete Tag
@router.delete("/tags/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete A Tag And Remove All Associations."""
    
    # Find Tag (Must Belong To Current User).
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Count Transactions Associated With This Tag.
    transaction_count = db.query(TransactionTag).filter(
        TransactionTag.tag_id == tag_id
    ).count()
    
    # Delete All Transaction Associations First.
    db.query(TransactionTag).filter(TransactionTag.tag_id == tag_id).delete()
    
    # Delete The Tag.
    db.delete(tag)
    db.commit()
    
    return {
        "message": f"Tag '{tag.name}' deleted successfully",
        "transactions_affected": transaction_count
    }

# ----------------------------------------------------------------------- Add Tag to Transaction
@router.post("/transactions/{transaction_id}/tags/{tag_id}")
def add_tag_to_transaction(
    transaction_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add A Tag To A Transaction."""
    
    # Verify Transaction Belongs To Current User.
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Verify Tag Belongs To Current User.
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check If Association Already Exists.
    existing_association = db.query(TransactionTag).filter(
        TransactionTag.transaction_id == transaction_id,
        TransactionTag.tag_id == tag_id
    ).first()
    
    if existing_association:
        raise HTTPException(
            status_code=400,
            detail="Tag is already associated with this transaction"
        )
    
    # Create Association.
    transaction_tag = TransactionTag(
        transaction_id=transaction_id,
        tag_id=tag_id
    )
    
    # Add Association To Database & Commit.
    db.add(transaction_tag)
    db.commit()
    
    # Return Success Message.
    return {"message": f"Tag '{tag.name}' added to transaction"}

# ----------------------------------------------------------------------- Remove Tag from Transaction
@router.delete("/transactions/{transaction_id}/tags/{tag_id}")
def remove_tag_from_transaction(
    transaction_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove A Tag From A Transaction."""
    
    # Verify Transaction Belongs To Current User.
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Find And Delete Association.
    association = db.query(TransactionTag).filter(
        TransactionTag.transaction_id == transaction_id,
        TransactionTag.tag_id == tag_id
    ).first()
    
    if not association:
        raise HTTPException(
            status_code=404,
            detail="Tag is not associated with this transaction"
        )
    
    # Delete Association.
    db.delete(association)
    db.commit()
    
    # Return Success Message.
    return {"message": "Tag removed from transaction"}

# ----------------------------------------------------------------------- Get Transaction Tags
@router.get("/transactions/{transaction_id}/tags")
def get_transaction_tags(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get All Tags For A Specific Transaction."""
    
    # Verify Transaction Belongs To Current User.
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get Tags For This Transaction.
    tags = db.query(Tag).join(TransactionTag).filter(
        TransactionTag.transaction_id == transaction_id,
        Tag.user_id == current_user.id
    ).all()
    
    # Return Tags.
    return tags

# ----------------------------------------------------------------------- Get Tag Transaction Count
@router.get("/tags/{tag_id}/transaction-count")
def get_tag_transaction_count(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get The Number Of Transactions Associated With A Tag."""
    
    # Verify Tag Belongs To Current User.
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Count Transactions Associated With This Tag.
    transaction_count = db.query(TransactionTag).filter(
        TransactionTag.tag_id == tag_id
    ).count()
    
    # Return Tag Transaction Count.
    return {
        "tag_id": tag_id,
        "tag_name": tag.name,
        "transaction_count": transaction_count
    }

# ----------------------------------------------------------------------- Initialize Default Tags
@router.post("/tags/initialize")
def initialize_default_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initialize Default Tags For The Current User."""
    
    try:
        created_tags = create_default_tags(db, current_user.id)
        return {
            "message": f"Created {len(created_tags)} default tags",
            "tags_created": len(created_tags)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error initializing default tags: {str(e)}"
        )

