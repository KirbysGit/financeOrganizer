# Note : These Models Are Used For Serializing, Validating, And Returning Data Through The FastAPI Responses.

# Imports.
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

# -------------------------------------------------------- Transaction Models.

# Transaction Create Model For Requests.
class TransactionCreate(BaseModel):
    date: date
    vendor: str
    description: str
    amount: float
    category_primary: str = "other"
    notes: Optional[str] = None
    account_data: Optional[dict] = None  # Account selection data

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
    
    # Enhanced fields
    is_duplicate: Optional[bool] = False
    duplicate_count: Optional[int] = 0
    last_updated: Optional[datetime] = None
    account_details: Optional[dict] = None
    institution_details: Optional[dict] = None

    class Config:
        from_attributes = True

# -------------------------------------------------------- File Upload Models.

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
    total_rows_processed: Optional[int] = 0
    transactions_skipped: Optional[int] = 0
    total_amount_imported: Optional[float] = 0.0
    processing_completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Upload Response Model For Detailed Upload Results.
class UploadResponse(BaseModel):
    message: str
    file_id: int
    transactions_added: int
    transactions_skipped: int
    total_rows_processed: int
    total_amount_imported: float
    errors: list[str]
    account_balance: float
    upload_timestamp: datetime
    processing_duration_ms: Optional[int] = None

# -------------------------------------------------------- Plaid Models.

class LinkTokenRequest(BaseModel):
    user_id: str

class LinkTokenResponse(BaseModel):
    link_token: str

class PublicTokenExchangeRequest(BaseModel):
    public_token: str

class AccessTokenResponse(BaseModel):
    access_token: str
    item_id: str

# -------------------------------------------------------- Account Models.

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

# -------------------------------------------------------- User Authentication Models.

# User Create Model For Registration.
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

# User Login Model.
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# User Out Model For Responses (Excludes Password).
class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    is_active: bool
    google_id: Optional[str] = None
    picture: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# -------------------------------------------------------- User Authentication Models.

# Google Auth Code Model For Auth-Code Flow.
class GoogleAuthCodeRequest(BaseModel):
    code: str
    redirect_uri: str

# Authentication Response Model.
class AuthResponse(BaseModel):
    user: UserOut
    access_token: str
    token_type: str = "bearer"
    message: str

# Password Reset Request Model.
class PasswordResetRequest(BaseModel):
    email: EmailStr

# Password Reset Model.
class PasswordReset(BaseModel):
    token: str
    new_password: str

# -------------------------------------------------------- Monthly Snapshot Models.

# Monthly Snapshot Model For Tracking User Financial Metrics Over Time.
class MonthlySnapshot(BaseModel):
    id: int
    user_id: int
    snapshot_date: date  # First day of the month
    net_worth: float
    total_assets: float
    total_liabilities: float
    monthly_cash_flow: float
    monthly_income: float
    monthly_spending: float
    transaction_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# -------------------------------------------------------- Monthly Snapshot Create Model.

class MonthlySnapshotCreate(BaseModel):
    user_id: int
    snapshot_date: date
    net_worth: float
    total_assets: float
    total_liabilities: float
    monthly_cash_flow: float
    monthly_income: float
    monthly_spending: float
    transaction_count: int

# Weekly Centi Score Model
class WeeklyCentiScore(BaseModel):
    id: int
    user_id: int
    score_date: date
    total_score: int
    net_worth_score: int
    assets_score: int
    liabilities_score: int
    cash_flow_score: int
    net_worth: float
    total_assets: float
    total_liabilities: float
    monthly_cash_flow: float
    transaction_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# -------------------------------------------------------- Weekly Centi Score Create Model.

class WeeklyCentiScoreCreate(BaseModel):
    user_id: int
    score_date: date
    total_score: int
    net_worth_score: int
    assets_score: int
    liabilities_score: int
    cash_flow_score: int
    net_worth: float
    total_assets: float
    total_liabilities: float
    monthly_cash_flow: float
    transaction_count: int