# Note : These Defines Actual Database Schemas.

# Imports.
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
import os

# Create Base Class For ORM Models.
Base = declarative_base()

# -------------------------------------------------------- Account Model
class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, unique=True, index=True)  # Plaid account ID
    item_id = Column(String, index=True)  # Plaid item ID (institution connection)
    name = Column(String)  # "Plaid Checking"
    official_name = Column(String)  # Official bank name
    type = Column(String)  # "depository", "credit", "loan", etc.
    subtype = Column(String)  # "checking", "savings", "credit card", etc.
    mask = Column(String)  # Last 4 digits
    
    # Balance Information
    current_balance = Column(Float)
    available_balance = Column(Float)
    limit = Column(Float)  # Credit limit for credit cards
    currency = Column(String, default="USD")
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="account")

# -------------------------------------------------------- Enhanced Transaction Model
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Plaid Integration
    transaction_id = Column(String, unique=True, index=True)  # Plaid transaction ID
    account_id = Column(String, ForeignKey("accounts.account_id"))  # Link to account
    
    # Basic Transaction Info
    date = Column(Date, index=True)
    amount = Column(Float)  # Negative for expenses, positive for income
    
    # Merchant/Vendor Info
    vendor = Column(String, index=True)  # Merchant name or manual entry
    merchant_name = Column(String)  # Official merchant name from Plaid
    description = Column(String)  # Transaction description
    
    # Categorization
    category_primary = Column(String, index=True)  # Primary category
    category_detailed = Column(String)  # Detailed subcategory
    transaction_type = Column(String)  # "special", "place", "digital", etc.
    
    # Source Tracking
    source = Column(String, default="manual")  # "plaid", "csv", "manual"
    file = Column(String)  # Original file name or "plaid"
    
    # Additional Plaid Data
    iso_currency_code = Column(String, default="USD")
    location_address = Column(String)
    location_city = Column(String)
    location_state = Column(String)
    location_country = Column(String)
    
    # Payment Metadata
    payment_reference = Column(String)
    payment_method = Column(String)
    
    # Metadata
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    notes = Column(Text)  # User notes
    
    # Relationships
    account = relationship("Account", back_populates="transactions")

# -------------------------------------------------------- Institution Model
class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(String, unique=True, index=True)  # Plaid institution ID
    name = Column(String)  # "Chase", "Bank of America", etc.
    item_id = Column(String, unique=True, index=True)  # Plaid item ID
    
    # Connection Status
    is_connected = Column(Boolean, default=True)
    last_sync = Column(DateTime)
    access_token = Column(String)  # Encrypted access token
    
    # Metadata
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

# -------------------------------------------------------- File Upload Tracking
class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    original_filename = Column(String)
    file_type = Column(String)  # "csv", "plaid"
    upload_date = Column(DateTime)
    transaction_count = Column(Integer)
    notes = Column(Text)
    content_hash = Column(String)  # For duplicate detection
    
    # Processing Status
    status = Column(String, default="processed")  # "processing", "processed", "error"
    error_message = Column(Text)

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance_tracker.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Tables
Base.metadata.create_all(bind=engine)
