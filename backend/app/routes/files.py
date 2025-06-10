# Imports.
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Body

# Local Imports.
from app.utils.db_utils import get_db
from app.database import UploadedFile, Transaction
from app.models import UploadedFileOut, TransactionOut

router = APIRouter()      # Sets Up Modular Sub-Router For FastAPI.

# ----------------------------------------------------------------------- Get All Files.
@router.get("/files", response_model=list[UploadedFileOut])
def get_files(db: Session = Depends(get_db)): 
    return db.query(UploadedFile).all() # Query For All UploadedFile Items, And Return All.

# ----------------------------------------------------------------------- Delete File By File Id.
@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(UploadedFile).get(file_id)                                  # Get File By File Id.
    if not file:                                                                # If File Does Not Exist.
        raise HTTPException(status_code=404, detail="File Not Found.")          # Return 404.
    
    db.query(Transaction).filter(Transaction.file == file.filename).delete()    # Else, Delete All Transactions W/ Said Filename.

    db.delete(file)                                                             # Delete File Item.
    
    db.commit()                                                                 # Commit To Database.
    return {"message": "{file_id} successfully deleted."}                       # Return Success Message.

# ----------------------------------------------------------------------- Rename File By File Id.
@router.patch("/files/{file_id}")
def rename_file(file_id: int, new_name: str = Body(..., embed=True), db: Session = Depends(get_db)):
    file = db.query(UploadedFile).get(file_id)                              # Get Uploaded File By File Id.
    if not file:                                                            # If File Does Not Exist.
        raise HTTPException(status_code=404, detail="File Not Found.")      # Return 404.
    
    file.filename = new_name                                                # Else, Set File Name To New Name.
    db.commit()                                                             # Commit To Database.
    return {"message" : "File {file_id} renamed '{new_name}'."}             # Return Success Message.

# ----------------------------------------------------------------------- Get All Transactions By File Id.
@router.get("/files/{file_id}/transactions", response_model=list[TransactionOut])
def get_transactions_by_file(file_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.file == file_id).all()  # Query Transactions Where 'file' Field Matches 'file_id'.
    return transactions                                                             # Return Matching Transactions.