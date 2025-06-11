# Imports.
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Body

# Local Imports.
from app.utils.db_utils import get_db
from app.database import FileUpload, Transaction
from app.models import FileUploadOut, TransactionOut

router = APIRouter()    # Sets Up Modular Sub-Router For FastAPI.

# ----------------------------------------------------------------------- Get All Files.
@router.get("/files", response_model=list[FileUploadOut])
def get_files(db: Session = Depends(get_db)):
    # Query For All FileUpload Items, And Return All.
    return db.query(FileUpload).all()

# ----------------------------------------------------------------------- Get Transactions From File.
@router.get("/files/{file_id}/transactions", response_model=list[TransactionOut])
def get_file_transactions(file_id: int, db: Session = Depends(get_db)):
    # Get File By File Id.
    file = db.query(FileUpload).get(file_id)
    
    # If File Not Found, Return 404 Error.
    if not file:
        raise HTTPException(status_code=404, detail="File not found") 
    
    # Get All Transactions From File.
    transactions = db.query(Transaction).filter(Transaction.file == file.filename).all()
    
    # Return Transactions.
    return transactions

# ----------------------------------------------------------------------- Delete File.
@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    # Get Uploaded File By File Id.
    file = db.query(FileUpload).get(file_id)
    
    # If File Not Found, Return 404 Error.
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete All Transactions From File.
    db.query(Transaction).filter(Transaction.file == file.filename).delete()
    
    # Delete File.
    db.delete(file)
    
    # Commit To Database.
    db.commit()
    
    # Return Success Message.
    return {"message": f"File {file_id} and its transactions deleted successfully"}

# ----------------------------------------------------------------------- Rename File By File Id.
@router.patch("/files/{file_id}")
def rename_file(file_id: int, new_name: str = Body(..., embed=True), db: Session = Depends(get_db)):
    # Get Uploaded File By File Id.
    file = db.query(FileUpload).get(file_id)

    # If File Not Found, Return 404.
    if not file:                                                          
        raise HTTPException(status_code=404, detail="File Not Found.")
    
    # Else Set File Name To New Name.
    file.filename = new_name

    # Commit To Database.
    db.commit()

    # Return Success Message.
    return {"message": f"File {file_id} renamed to '{new_name}'."}