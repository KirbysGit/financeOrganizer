from pydantic import BaseModel
from datetime import date

class TransactionOut(BaseModel):
    id: int
    date: date
    description: str
    amount: float
    type: str
    
    class Config:
        from_attributes = True