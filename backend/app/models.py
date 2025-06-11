# Note : These Models Are Used For Serializing, Validating, And Returning Data Through The FastAPI Responses.

# Imports.
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Transaction Create Model For Requests.
class TransactionCreate(BaseModel):
    date: date
    vendor: str
    description: str
    amount: float
    category_primary: str = "other"
    notes: Optional[str] = None

# Transaction Out Model For Responses.
class TransactionOut(BaseModel):
    id: int
    transaction_id: Optional[str]
    account_id: Optional[str]
    date: date
    amount: float
    vendor: str
    merchant_name: Optional[str]
    description: str
    category_primary: str
    category_detailed: Optional[str]
    transaction_type: Optional[str]
    source: str
    file: str
    iso_currency_code: Optional[str]
    location_address: Optional[str]
    location_city: Optional[str]
    location_state: Optional[str]
    location_country: Optional[str]
    payment_reference: Optional[str]
    payment_method: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True

# FileUpload Out Model For Responses.
class FileUploadOut(BaseModel):
    id: int
    filename: str
    original_filename: Optional[str]
    file_type: str
    upload_date: datetime
    transaction_count: int
    status: str
    error_message: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True

# Plaid Models
class LinkTokenRequest(BaseModel):
    user_id: str

class LinkTokenResponse(BaseModel):
    link_token: str

class PublicTokenExchangeRequest(BaseModel):
    public_token: str

class AccessTokenResponse(BaseModel):
    access_token: str
    item_id: str

# Account Out Model For Responses.
class AccountOut(BaseModel):
    id: int
    account_id: str
    item_id: Optional[str]
    name: Optional[str]
    official_name: Optional[str]
    type: Optional[str]
    subtype: Optional[str]
    mask: Optional[str]
    current_balance: Optional[float]
    available_balance: Optional[float]
    limit: Optional[float]
    currency: Optional[str]
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Institution Out Model For Responses.
class InstitutionOut(BaseModel):
    id: int
    institution_id: Optional[str]
    name: Optional[str]
    item_id: str
    is_connected: bool
    last_sync: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True