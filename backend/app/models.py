from pydantic import BaseModel
from datetime import date, datetime

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

class UploadedFileOut(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    num_transactions: int
    notes: str
    content_hash: str
    
    class Config:
        from_attributes = True