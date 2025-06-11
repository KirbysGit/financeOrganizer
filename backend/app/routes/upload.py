# Imports.
import hashlib
import pandas as pd
from io import StringIO
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

# Local Imports.
from app.utils.db_utils import get_db
from app.database import Transaction, FileUpload

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
    
    # Add, Commit & Referesh In Database.
    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)
    
    # Process Transactions.
    transactions_added = 0
    errors = []
    
    for index, row in df.iterrows():
        try:
            # Map CSV columns to our enhanced transaction model
            transaction_data = {
                'date': pd.to_datetime(row.get('Date', row.get('date'))).date(),
                'amount': float(row.get('Amount', row.get('amount', 0))),
                'vendor': str(row.get('Vendor', row.get('vendor', row.get('Description', 'Unknown')))),
                'description': str(row.get('Description', row.get('description', ''))),
                'category_primary': str(row.get('Category', row.get('category', row.get('Type', 'other')))),
                'source': 'csv',
                'file': file.filename,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Create Transaction.
            transaction = Transaction(**transaction_data)
            db.add(transaction)
            transactions_added += 1
            
        except Exception as e:
            errors.append(f"Row {index + 1}: {str(e)}")
    
    # Update FileUpload with results
    uploaded_file.transaction_count = transactions_added
    uploaded_file.status = "processed" if not errors else "error"
    if errors:
        uploaded_file.error_message = "; ".join(errors[:5])  # Store first 5 errors
    
    db.commit()
    
    return {
        "message": f"Successfully uploaded {transactions_added} transactions",
        "file_id": uploaded_file.id,
        "transactions_added": transactions_added,
        "errors": errors[:10] if errors else []  # Return first 10 errors
    }