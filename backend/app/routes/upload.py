from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal, Transaction
from app.parser import parse_chase_csv
import traceback

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        if not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
            
        contents = await file.read()
        df = parse_chase_csv(contents)

        for _, row in df.iterrows():
            tx = Transaction(
                date=row["date"],
                description=row["description"],
                amount=row["amount"],
                type=row["type"]
            )
            db.add(tx)
        db.commit()

        return {"message": f"Successfully uploaded {len(df)} transactions"}
    except Exception as e:
        db.rollback()
        print(f"Error processing file: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))