# Note : These Models Are Used For Serializing, Validating, And Returning Data Through The FastAPI Responses.

# Imports.
from pydantic import BaseModel
from datetime import date, datetime

# Transaction Out Model For Responses.
class TransactionOut(BaseModel):
    id: int
    date: date
    vendor: str
    description: str
    amount: float
    type: str
    file: str
    
    class Config:
        from_attributes = True

# Transaction Create Model For Creating Transaction Item.
class TransactionCreate(BaseModel):
    date: date
    vendor: str
    description: str
    amount: float
    type: str
    file: str

# UploadedFile Out Model For Respones.
class UploadedFileOut(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    num_transactions: int
    notes: str
    content_hash: str
    
    class Config:
        from_attributes = True