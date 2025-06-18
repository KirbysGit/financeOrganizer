# Imports.
import hashlib
import pandas as pd
from io import StringIO
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

# Local Imports.
from app.utils.db_utils import get_db
from app.database import Transaction, FileUpload, Account

router = APIRouter()    # Sets Up Modular Sub-Router for FastAPI.

# ----------------------------------------------------------------------- Upload CSV File.
@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Check If File Is CSV.
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # Read File Content.
    content = await file.read()
    content_str = content.decode('utf-8')
    
    # Create Content Hash For Duplicate Detection.
    content_hash = hashlib.md5(content).hexdigest()
    
    # Check If File Already Exists.
    existing_file = db.query(FileUpload).filter_by(content_hash=content_hash).first()
    if existing_file:
        raise HTTPException(status_code=400, detail="This file has already been uploaded")
    
    # Parse CSV.
    try:
        df = pd.read_csv(StringIO(content_str))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")
    
    # Create FileUpload Item.
    uploaded_file = FileUpload(
        filename=file.filename,
        original_filename=file.filename,
        file_type="csv",
        upload_date=datetime.now(),
        transaction_count=0,
        content_hash=content_hash,
        status="processing"
    )
    
    # Add, Commit & Refresh In Database.
    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)
    
    # Get or create default account for CSV transactions
    default_account = db.query(Account).filter_by(
        name="CSV Import Account",
        type="depository"
    ).first()
    
    if not default_account:
        default_account = Account(
            account_id=f"csv_default_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            name="CSV Import Account",
            official_name="CSV Import Account",
            type="depository",
            subtype="checking",
            current_balance=0,
            available_balance=0,
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(default_account)
        db.commit()
        db.refresh(default_account)
    
    # Process Transactions.
    transactions_added = 0
    transactions_skipped = 0
    errors = []
    total_amount = 0
    
    print(f"Debug - Processing CSV file: {file.filename}")
    print(f"Debug - CSV columns: {df.columns.tolist()}")
    
    for index, row in df.iterrows():
        try:
            # Map CSV columns to our enhanced transaction model
            amount = float(row.get('Amount', row.get('amount', 0)))
            date_str = row.get('Date', row.get('date'))
            print(f"Debug - Raw date from CSV: {date_str}")
            
            # Parse date with explicit format
            try:
                date = pd.to_datetime(date_str).date()
                print(f"Debug - Parsed date: {date}, type: {type(date)}")
            except Exception as e:
                print(f"Debug - Date parsing error: {str(e)}")
                raise
            
            vendor = str(row.get('Vendor', row.get('vendor', row.get('Description', 'Unknown'))))
            description = str(row.get('Description', row.get('description', '')))
            category = str(row.get('Category', row.get('category', row.get('Type', 'other'))))
            
            # Check if transaction already exists using multiple fields
            existing_transaction = db.query(Transaction).filter(
                Transaction.date == date,
                Transaction.amount == amount,
                Transaction.vendor == vendor,
                Transaction.description == description,
                Transaction.category_primary == category,
                Transaction.source == 'csv'
            ).first()
            
            if existing_transaction:
                print(f"Debug - Skipping duplicate transaction: {date} {amount} {vendor}")
                transactions_skipped += 1
                continue
            
            # Generate unique transaction hash
            timestamp = datetime.now().timestamp()
            hash_string = f"{date}|{amount}|{vendor}|{description}|{category}|{timestamp}|{index}"
            transaction_hash = hashlib.sha256(hash_string.encode()).hexdigest()
            
            # Create transaction with explicit transaction_id
            transaction = Transaction(
                transaction_id=f"csv_{timestamp}_{index}",
                date=date,
                amount=amount,
                vendor=vendor,
                description=description,
                category_primary=category,
                source='csv',
                file=file.filename,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                account_id=default_account.account_id,
                transaction_hash=transaction_hash,
                iso_currency_code='USD'
            )
            
            try:
                db.add(transaction)
                db.flush()  # Flush to check for immediate errors
                print(f"Debug - Added transaction: {date} {amount} {vendor}")
                transactions_added += 1
                total_amount += amount
            except IntegrityError:
                db.rollback()
                print(f"Debug - Integrity error for transaction: {date} {amount} {vendor}")
                transactions_skipped += 1
                continue
            
        except Exception as e:
            print(f"Debug - Error processing row {index + 1}: {str(e)}")
            errors.append(f"Row {index + 1}: {str(e)}")
    
    # Update default account balance
    default_account.current_balance = total_amount
    default_account.available_balance = total_amount
    default_account.updated_at = datetime.now()
    
    # Update FileUpload with results
    uploaded_file.transaction_count = transactions_added
    uploaded_file.status = "processed" if not errors else "error"
    if errors:
        uploaded_file.error_message = "; ".join(errors[:5])  # Store first 5 errors
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving transactions: {str(e)}")
    
    return {
        "message": f"Successfully processed {transactions_added} transactions (skipped {transactions_skipped} duplicates)",
        "file_id": uploaded_file.id,
        "transactions_added": transactions_added,
        "transactions_skipped": transactions_skipped,
        "errors": errors[:10] if errors else [],  # Return first 10 errors
        "account_balance": total_amount
    }