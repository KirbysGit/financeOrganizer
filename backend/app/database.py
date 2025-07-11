# Note : These Defines Actual Database Schemas.

# Imports.
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
import os

# Create Base Class For ORM Models.
Base = declarative_base()

# -------------------------------------------------------- User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)      # User ID in DB. (Auto-Incrementing Primary Key)
    first_name = Column(String, nullable=False)             # User's First Name.
    last_name = Column(String, nullable=False)              # User's Last Name.
    email = Column(String, unique=True, index=True, nullable=False)  # User's Email Address. (Unique, Indexed)
    hashed_password = Column(String, nullable=False)        # Hashed Password. (Never Store Plain Text)
    
    # Account Status.
    is_active = Column(Boolean, default=True)               # Whether User Account Is Active.
    is_verified = Column(Boolean, default=False)            # Whether Email Has Been Verified.
    
    # Google OAuth Fields.
    google_id = Column(String, unique=True, index=True, nullable=True)  # Google User ID.
    picture = Column(String, nullable=True)                 # Google Profile Picture URL.
    
    # Metadata.
    created_at = Column(DateTime)                           # When User Account Was Created.
    updated_at = Column(DateTime)                           # When User Account Was Last Updated.
    last_login = Column(DateTime)                           # When User Last Logged In.
    
    # Relationships.
    accounts = relationship("Account", back_populates="user")  # One-To-Many Relationship With Accounts.
    transactions = relationship("Transaction", back_populates="user")  # One-To-Many Relationship With Transactions.
    institutions = relationship("Institution", back_populates="user")  # One-To-Many Relationship With Institutions.
    file_uploads = relationship("FileUpload", back_populates="user")  # One-To-Many Relationship With File Uploads.

# -------------------------------------------------------- Account Model
class Account(Base):
    # Set Table Name.
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)      # Account ID in DB. (Auto-Incrementing Primary Key)
    user_id = Column(Integer, ForeignKey("users.id"))       # Foreign Key Linking To User. (User Who Owns This Account)
    account_id = Column(String, unique=True, index=True)    # Plaid Account ID. (Unique Identifier From Plaid API)
    item_id = Column(String, index=True)                    # Plaid item ID. (Links Account To Institution Connection)
    name = Column(String)                                   # Name Of Account. (User-Friendly Name)
    official_name = Column(String)                          # Official Bank Name. (Formal Bank Account Name)
    type = Column(String)                                   # Credit, Loan, Depository, etc. (Account Type From Plaid)
    subtype = Column(String)                                # "Checking", "Savings", "Credit Card", etc. (Specific Account Subtype)
    mask = Column(String)                                   # Last 4 Digits. (Account Number Mask For Display)
    
    # Balance Information.
    current_balance = Column(Float)                         # Current Account Balance. (Real-Time From Plaid)
    available_balance = Column(Float)                       # Available Balance. (Amount That Can Be Spent/Withdrawn)
    limit = Column(Float)                                   # Credit Limit. (If Applicable)
    currency = Column(String, default="USD")                # Currency Code. (Defaults To USD)
    
    # Metadata.
    is_active = Column(Boolean, default=True)               # Whether Account Is Currently Active/Connected.
    created_at = Column(DateTime)                           # When Account Was First Created In Our System.
    updated_at = Column(DateTime)                           # When Account Was Last Updated/Synced.
    
    # Relationships.
    user = relationship("User", back_populates="accounts")  # Many-To-One Relationship With User.
    transactions = relationship("Transaction", back_populates="account")  # One-To-Many Relationship With Transactions.

# -------------------------------------------------------- Enhanced Transaction Model
class Transaction(Base):
    __tablename__ = "transactions"  # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)      # Transaction ID In DB. (Auto-Incrementing Primary Key)
    user_id = Column(Integer, ForeignKey("users.id"))       # Foreign Key Linking To User. (User Who Owns This Transaction)
    
    # Plaid Integration.
    transaction_id = Column(String, unique=True, index=True)  # Plaid Transaction ID. (Unique Identifier From Plaid API)
    account_id = Column(String, ForeignKey("accounts.account_id"))  # Foreign Key Linking To Account. (Plaid Account ID)
    
    # Basic Transaction Info.
    date = Column(Date, index=True)                         # Transaction Date. (Indexed For Fast Date-Based Queries)
    amount = Column(Float)                                  # Transaction Amount. (Negative For Expenses, Positive For Income)
    
    # Merchant/Vendor Info.
    vendor = Column(String, index=True)                     # Merchant Name Or Manual Entry. (Indexed For Fast Vendor Searches)
    merchant_name = Column(String)                          # Official Merchant Name From Plaid. (More Detailed Than Vendor)
    description = Column(String)                            # Transaction Description. (Detailed Transaction Info)
    
    # Categorization.
    category_primary = Column(String, index=True)           # Primary Category. (e.g., "food", "transportation") - Indexed For Fast Category Queries
    category_detailed = Column(String)                      # Detailed Subcategory. (e.g., "restaurants", "fast food")
    transaction_type = Column(String)                       # "special", "place", "digital", etc. (Plaid Transaction Type)
    
    # Source Tracking.
    source = Column(String, default="manual")               # "plaid", "csv", "manual". (How Transaction Was Imported)
    file = Column(String)                                   # Original File Name Or "plaid". (Tracks Import Source)
    
    # Additional Plaid Data.
    iso_currency_code = Column(String, default="USD")       # Currency Code. (Defaults To USD)
    location_address = Column(String)                       # Full Address From Plaid. (If Available)
    location_city = Column(String)                          # City From Plaid Location Data.
    location_state = Column(String)                         # State From Plaid Location Data.
    location_country = Column(String)                       # Country From Plaid Location Data.
    
    # Payment Metadata. 
    payment_reference = Column(String)                      # Payment Reference Number. (If Available)
    payment_method = Column(String)                         # Payment Method Used. (e.g., "card", "ach")
    
    # Metadata.
    created_at = Column(DateTime)                           # When Transaction Was Created In Our System.
    updated_at = Column(DateTime)                           # When Transaction Was Last Updated.
    notes = Column(Text)                                    # User Notes. (Longer Text Field For Additional Info)
    
    # Duplicate Prevention.
    transaction_hash = Column(String, unique=True, index=True)  # Hash Of Key Transaction Fields. (Prevents Duplicate Imports)
    
    # Relationships.
    user = relationship("User", back_populates="transactions")  # Many-To-One Relationship With User.
    account = relationship("Account", back_populates="transactions")  # Many-To-One Relationship With Account.

    def __init__(self, **kwargs):
        super().__init__(**kwargs)  # Call Parent Class Constructor.
        # Generate Transaction Hash For Duplicate Detection.
        self.transaction_hash = self._generate_transaction_hash()

    def _generate_transaction_hash(self):
        """Generate a unique hash for the transaction based on its key attributes."""
        import hashlib  # Import Hashlib For SHA-256 Hashing.
        key_fields = [
            str(self.transaction_id),    # Plaid Transaction ID.
            str(self.account_id),        # Account ID.
            str(self.date),              # Transaction Date.
            str(self.amount),            # Transaction Amount.
            str(self.vendor),            # Vendor Name.
            str(self.merchant_name),     # Merchant Name.
            str(self.description)        # Transaction Description.
        ]
        hash_string = "|".join(key_fields)  # Join Fields With Pipe Separator.
        return hashlib.sha256(hash_string.encode()).hexdigest()  # Generate SHA-256 Hash.

# -------------------------------------------------------- Institution Model
class Institution(Base):
    __tablename__ = "institutions"  # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)      # Institution ID In DB. (Auto-Incrementing Primary Key)
    user_id = Column(Integer, ForeignKey("users.id"))       # Foreign Key Linking To User. (User Who Owns This Institution)
    institution_id = Column(String, unique=True, index=True)  # Plaid Institution ID. (Unique Identifier From Plaid API)
    name = Column(String)                                   # "Chase", "Bank of America", etc. (Institution Name)
    item_id = Column(String, unique=True, index=True)       # Plaid Item ID. (Unique Identifier For This Connection)
    
    # Connection Status.
    is_connected = Column(Boolean, default=True)            # Whether Institution Is Currently Connected/Active.
    last_sync = Column(DateTime)                            # When Institution Was Last Synced With Plaid.
    access_token = Column(String)                           # Encrypted Access Token. (For Plaid API Calls)
    
    # Metadata.
    created_at = Column(DateTime)                           # When Institution Was First Connected.
    updated_at = Column(DateTime)                           # When Institution Was Last Updated.
    
    # Relationships.
    user = relationship("User", back_populates="institutions")

# -------------------------------------------------------- File Upload Tracking
class FileUpload(Base):
    __tablename__ = "file_uploads"  # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)      # Upload ID In DB. (Auto-Incrementing Primary Key)
    user_id = Column(Integer, ForeignKey("users.id"))       # Foreign Key Linking To User. (User Who Owns This File Upload)
    filename = Column(String)                               # Generated File Name. (Stored On Disk)
    original_filename = Column(String)                      # Original File Name. (User's Original File Name)
    file_type = Column(String)                              # "csv", "plaid" (Type Of File Uploaded)
    upload_date = Column(DateTime)                          # When File Was Uploaded.
    transaction_count = Column(Integer)                     # Number Of Transactions Imported From File.
    notes = Column(Text)                                    # User Notes About The Upload.
    content_hash = Column(String)                           # Hash Of File Content. (For Duplicate Detection)
    
    # Processing Status.
    status = Column(String, default="processed")            # "processing", "processed", "error". (Current Processing Status)
    error_message = Column(Text)                            # Error Message If Processing Failed.
    
    # Enhanced Statistics.
    total_rows_processed = Column(Integer, default=0)       # Total Number Of Rows In CSV File.
    transactions_skipped = Column(Integer, default=0)       # Number Of Duplicate Transactions Skipped.
    total_amount_imported = Column(Float, default=0.0)      # Total Amount Of All Imported Transactions.
    processing_completed_at = Column(DateTime)              # When Processing Was Completed.
    
    # Relationships.
    user = relationship("User", back_populates="file_uploads")

# Database Setup.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance_tracker.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Tables.
Base.metadata.create_all(bind=engine)
