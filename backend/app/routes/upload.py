from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import SessionLocal, Transaction, UploadedFile
from datetime import date
from app.parser import parse_chase_csv
import traceback
import hashlib

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...), 
    notes: str = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # If Not CSV, Return Error.
        if not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        # Parse Contents Of File.
        contents = await file.read()

        # Obtain FileName.
        filename = file.filename;

        content_hash = hashlib.sha256(contents).hexdigest()

        # 1. Parse W/ Our Chase CSV Handler.
        df = parse_chase_csv(contents, filename)

        # 2. Create UploadedFile Item.
        uploaded_file = UploadedFile(
            filename=filename,
            num_transactions=len(df),
            notes=notes or "Auto-generated on upload",
            content_hash=content_hash
        )

        db.add(uploaded_file)
        db.commit()
        db.refresh(uploaded_file)

        # 3. Insert Transactions Items.
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

        
        db.commit()

        return {"message": f"Successfully uploaded {len(df)} transactions"}
    except Exception as e:
        db.rollback()
        print(f"Error processing file: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))