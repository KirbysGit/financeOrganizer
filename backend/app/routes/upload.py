# Imports.
import hashlib
import traceback
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form

# Local Imports.
from app.utils.db_utils import get_db
from app.parser import parse_chase_csv
from app.database import Transaction, UploadedFile

router = APIRouter()      # Sets Up Modular Sub-Router For FastAPI.

# ----------------------------------------------------------------------- Upload CSV File.
@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...), 
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    try:
        if not file.filename.lower().endswith('.csv'):                                  # If Not CSV File.
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")   # Return Error Message.
        
        contents = await file.read()                                                    # Parse Contents Of File.
        filename = file.filename;
         
        
        # Create Hash From File Contents.                  
        content_hash = hashlib.sha256(contents).hexdigest()       

        # Check If File Already Exists.
        existing_file = db.query(UploadedFile).filter_by(content_hash=content_hash).first()

        if existing_file:
            raise HTTPException(status_code=400, detail="This file has already been uploaded.")                         

        # Parse W/ Our Chase CSV Handler.
        df = parse_chase_csv(contents, filename)

        # Create UploadedFile Item.
        uploaded_file = UploadedFile(
            filename=filename,
            num_transactions=len(df),
            notes=notes or "Auto-generated on upload",
            content_hash=content_hash
        )

        db.add(uploaded_file)
        db.commit()
        db.refresh(uploaded_file)

        # Insert Transactions Items.
        for _, row in df.iterrows():
            tx = Transaction(
                date=row["date"],
                vendor=row["vendor"],
                description=row["description"],
                amount=row["amount"],
                type=row["type"],
                file=row["file"]
            )
            db.add(tx)

        # Commit To Database.
        db.commit()

        # Return Success Message.
        return {"message": f"Successfully uploaded {len(df)} transactions"}
    except Exception as e:
        db.rollback()                                       # Undo Any Pending Changes To Database.
        print(f"Error processing file: {str(e)}")           # Print Error Message.
        print(traceback.format_exc())                       # Print Trace Of Error.
        raise HTTPException(status_code=500, detail=str(e)) # Return Error Msg W/ HTTP 500.