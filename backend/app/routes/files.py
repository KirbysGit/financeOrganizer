# Imports.
from sqlalchemy.orm import Session
from app.models import UploadedFileOut
from fastapi import APIRouter, Depends, HTTPException, Body
from app.database import SessionLocal, UploadedFile, Transaction

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------------------------------------------------- Get All Files.
@router.get("/files", response_model=list[UploadedFileOut])
def get_files(db: Session = Depends(get_db)):
    return db.query(UploadedFile).all()

# ----------------------------------------------------------------------- Delete File By File Id.
@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    # Get File By File Id.
    file = db.query(UploadedFile).get(file_id)

    # If File Doesn't Exists, Return Error.
    if not file:
        raise HTTPException(status_code=404, detail="File Not Found.")
    
    # Delete All Associated Transactions To Said File.
    db.query(Transaction).filter(Transaction.file == file.filename).delete()

    # Delete File.
    db.delete(file)
    
    db.commit()
    return {"message": "{file_id} successfully deleted."}

# ----------------------------------------------------------------------- Rename File By File Id.
@router.patch("/files/{file_id}")
def rename_file(file_id: int, new_name: str = Body(..., embed=True), db: Session = Depends(get_db)):
    file = db.query(UploadedFile).get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File Not Found.")
    
    file.filename = new_name
    db.commit()
    return {"message" : "File {file_id} renamed '{new_name}'."}

# ----------------------------------------------------------------------- Get All Transactions By File Id.
@router.get("/files/{file_id}/transactions")
def get_transactions_by_file(file_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.file == file_id).all()
    return transactions