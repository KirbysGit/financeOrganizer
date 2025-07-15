# Imports.
import hashlib
import pandas as pd
from io import StringIO
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.exc import IntegrityError
import time

# Local Imports.
from app.utils.db_utils import get_db
from app.utils.auth_utils import get_current_user
from app.database import Transaction, FileUpload, Account, User
from app.models import UploadResponse

# Create Router Instance.
router = APIRouter(tags=["Upload"])

# -------------------------------------------------------- Upload CSV File.
@router.post("/upload", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...), 
    account_data: str = Form(None),  # JSON string with account info
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload A CSV File And Process Transactions."""

    # Track Processing Time.
    start_time = time.time()
    
    # Check If File Is CSV.
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV Files Are Allowed.")
    
    # Read File Content.
    content = await file.read()
    content_str = content.decode('utf-8')
    
    # Create Content Hash For Duplicate Detection.
    content_hash = hashlib.md5(content).hexdigest()
    
    # Check If File Already Exists For This User.
    existing_file = db.query(FileUpload).filter_by(
        content_hash=content_hash,
        user_id=current_user.id
    ).first()
    if existing_file:
        raise HTTPException(status_code=400, detail="This file has already been uploaded")
    
    # Parse CSV.
    try:
        df = pd.read_csv(StringIO(content_str))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")
    
    # Create FileUpload Item.
    uploaded_file = FileUpload(
        user_id=current_user.id,
        filename=file.filename,
        original_filename=file.filename,
        file_type="csv",
        upload_date=datetime.now(),
        transaction_count=0,
        content_hash=content_hash,
        status="processing",
        total_rows_processed=len(df)
    )
    
    # Add, Commit & Refresh In Database.
    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)
    
    # Handle Account Selection
    import json
    selected_account = None
    
    if account_data:
        try:
            account_info = json.loads(account_data)
            
            if account_info.get('type') == 'cash':
                # Cash transactions don't need an account
                selected_account = None
            elif account_info.get('is_new'):
                # Create new manual account
                selected_account = Account(
                    user_id=current_user.id,
                    account_id=account_info['account_id'],
                    name=account_info['name'],
                    official_name=account_info['name'],
                    type=account_info['type'],
                    subtype=account_info['subtype'],
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
                # Use existing account (must belong to current user)
                selected_account = db.query(Account).filter_by(
                    account_id=account_info['account_id'],
                    user_id=current_user.id
                ).first()
                
                if not selected_account:
                    raise HTTPException(status_code=400, detail="Selected account not found or doesn't belong to you")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid account data format")
    
    # Process Transactions.
    transactions_added = 0
    transactions_skipped = 0
    errors = []
    total_amount = 0
    
    for index, row in df.iterrows():
        try:
            # Map CSV Columns To Our Enhanced Transaction Model.
            amount = float(row.get('Amount', row.get('amount', 0)))
            date_str = row.get('Date', row.get('date'))
            
            # Parse Date With Explicit Format.
            try:
                date = pd.to_datetime(date_str).date()
            except Exception as e:
                raise
            
            # Get Vendor, Description, And Category.
            vendor = str(row.get('Vendor', row.get('vendor', row.get('Description', 'Unknown'))))
            description = str(row.get('Description', row.get('description', '')))
            category = str(row.get('Category', row.get('category', row.get('Type', 'other'))))
            
            # Check If Transaction Already Exists Using Multiple Fields For This User.
            existing_transaction = db.query(Transaction).filter(
                Transaction.date == date,
                Transaction.amount == amount,
                Transaction.vendor == vendor,
                Transaction.description == description,
                Transaction.category_primary == category,
                Transaction.source == 'csv',
                Transaction.user_id == current_user.id
            ).first()
            
            # If Transaction Already Exists, Skip It.
            if existing_transaction:
                transactions_skipped += 1
                continue
            
            # Generate Unique Transaction Hash.
            timestamp = datetime.now().timestamp()
            hash_string = f"{date}|{amount}|{vendor}|{description}|{category}|{timestamp}|{index}"
            transaction_hash = hashlib.sha256(hash_string.encode()).hexdigest()
            
            # Create Transaction With Account Info.
            transaction_data = {
                'user_id': current_user.id,
                'transaction_id': f"csv_{timestamp}_{index}",
                'date': date,
                'amount': amount,
                'vendor': vendor,
                'description': description,
                'category_primary': category,
                'source': 'csv',
                'file': file.filename,
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'transaction_hash': transaction_hash,
                'iso_currency_code': 'USD'
            }
            
            # Add account info if not cash transaction
            if selected_account:
                transaction_data['account_id'] = selected_account.account_id
            else:
                # Cash transaction - no account_id
                transaction_data['account_id'] = None
            
            transaction = Transaction(**transaction_data)
            
            try:
                db.add(transaction)
                db.flush()  # Flush To Check For Immediate Errors.
                transactions_added += 1
                total_amount += amount
            except IntegrityError:
                db.rollback()
                transactions_skipped += 1
                continue
            
        except Exception as e:
            errors.append(f"Row {index + 1}: {str(e)}")
    
    # Update Account Balance if account exists and not cash
    if selected_account:
        selected_account.current_balance = total_amount
        selected_account.available_balance = total_amount
        selected_account.updated_at = datetime.now()
    
    # Update FileUpload With Enhanced Results.
    processing_completed_at = datetime.now()
    uploaded_file.transaction_count = transactions_added
    uploaded_file.transactions_skipped = transactions_skipped
    uploaded_file.total_amount_imported = total_amount
    uploaded_file.processing_completed_at = processing_completed_at
    uploaded_file.status = "processed" if not errors else "error"
    if errors:
        uploaded_file.error_message = "; ".join(errors[:5])  # Store First 5 Errors.
    
    # Commit Changes To Database.
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving transactions: {str(e)}")
    
    # Calculate processing duration.
    processing_duration_ms = int((time.time() - start_time) * 1000)
    
    # Create detailed success message.
    upload_timestamp = processing_completed_at
    account_name = selected_account.name if selected_account else "Cash"
    
    if transactions_added > 0:
        message = f"File uploaded successfully at {upload_timestamp.strftime('%Y-%m-%d %H:%M:%S')}! Added {transactions_added} new transactions to {account_name}"
        if transactions_skipped > 0:
            message += f" and skipped {transactions_skipped} duplicates"
        message += f" from {len(df)} total rows."
    else:
        message = f"File uploaded at {upload_timestamp.strftime('%Y-%m-%d %H:%M:%S')} but no new transactions were added (all were duplicates)."
    
    # Return Enhanced Results.
    return UploadResponse(
        message=message,
        file_id=uploaded_file.id,
        transactions_added=transactions_added,
        transactions_skipped=transactions_skipped,
        total_rows_processed=len(df),
        total_amount_imported=total_amount,
        errors=errors[:10] if errors else [],
        account_balance=total_amount if selected_account else 0,
        upload_timestamp=upload_timestamp,
        processing_duration_ms=processing_duration_ms
    )