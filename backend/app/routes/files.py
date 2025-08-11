# File Routes.
#
# Note : Haven't really updated this in a while, still working minimally, but not w/ a lot
#        of robustness, will update this in future.
#
# Router : Prefix w/ "/files" & Tag w/ "Files".
#
# API Endpoints :
#   - 'get_files' - Get All Files For The Current User.
#   - 'get_file_transactions' - Get All Transactions From A Specific File.
#   - 'delete_file' - Delete A Specific File.
#   - 'rename_file' - Rename A Specific File.

# Imports.
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Body

# Local Imports.
from app.utils.db_utils import get_db
from app.utils.auth_utils import get_current_user
from app.models import FileUploadOut, TransactionOut
from app.database import FileUpload, Transaction, User

# Create Router Instance.
router = APIRouter(prefix="/files", tags=["Files"])

# -------------------------------------------------------- Get All Files.
@router.get("/", response_model=list[FileUploadOut])
def get_files(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Query For All FileUpload Items For This User, And Return All.
    return db.query(FileUpload).filter(FileUpload.user_id == current_user.id).all()

# -------------------------------------------------------- Get Transactions From File.
@router.get("/{file_id}/transactions", response_model=list[TransactionOut])
def get_file_transactions(
    file_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get File By File Id (Must Belong To Current User).
    file = db.query(FileUpload).filter(
        FileUpload.id == file_id,
        FileUpload.user_id == current_user.id
    ).first()
    
    # If File Not Found, Return 404 Error.
    if not file:
        raise HTTPException(status_code=404, detail="File not found") 
    
    # Get All Transactions From File For This User.
    transactions = db.query(Transaction).filter(
        Transaction.file == file.filename,
        Transaction.user_id == current_user.id
    ).all()
    
    # Return Transactions.
    return transactions

# ----------------------------------------------------------------------- Delete File.
@router.delete("/{file_id}")
def delete_file(
    file_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get Uploaded File By File Id (Must Belong To Current User).
    file = db.query(FileUpload).filter(
        FileUpload.id == file_id,
        FileUpload.user_id == current_user.id
    ).first()
    
    # If File Not Found, Return 404 Error.
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete All Transactions From File For This User.
    db.query(Transaction).filter(
        Transaction.file == file.filename,
        Transaction.user_id == current_user.id
    ).delete()
    
    # Delete File.
    db.delete(file)
    
    # Commit To Database.
    db.commit()
    
    # Return Success Message.
    return {"message": f"File {file_id} and its transactions deleted successfully"}

# ----------------------------------------------------------------------- Rename File By File Id.
@router.patch("/{file_id}")
def rename_file(
    file_id: int, 
    new_name: str = Body(..., embed=True), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get Uploaded File By File Id (Must Belong To Current User).
    file = db.query(FileUpload).filter(
        FileUpload.id == file_id,
        FileUpload.user_id == current_user.id
    ).first()

    # If File Not Found, Return 404.
    if not file:                                                          
        raise HTTPException(status_code=404, detail="File Not Found.")
    
    # Else Set File Name To New Name.
    file.filename = new_name

    # Commit To Database.
    db.commit()

    # Return Success Message.
    return {"message": f"File {file_id} renamed to '{new_name}'."}