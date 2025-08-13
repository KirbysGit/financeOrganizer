# Database File For The Backend.
#
# Note : These Define Actual Database Schemas. Want to simplify any models that are not needed.
#
# Models :
#   - 'User' - User Model.
#   - 'Account' - Account Model.
#   - 'Transaction' - Transaction Model.
#   - 'Institution' - Institution Model.
#   - 'FileUpload' - File Upload Model.
#   - 'MonthlySnapshot' - Monthly Snapshot Model.
#   - 'WeeklyCentiScore' - Weekly Centi Score Model.
#   - 'AccountBalanceHistory' - Account Balance History Model.
#   - 'Tag' - Tag Model.
#   - 'TransactionTag' - Transaction Tag Association Model.

# Functions : 
#   - 'get_database_url' - Get Database URL.
#   - 'create_engine_safe' - Create Engine Safe.
#   - 'get_engine' - Get Engine.
#   - 'get_session' - Get Session.
#   - 'create_tables' - Create Tables.

# Imports.
import os
from datetime import datetime
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text

# Create Base Class For ORM Models.
Base = declarative_base()

# -------------------------------------------------------- User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)                  # User ID in DB. (Auto-Incrementing Primary Key)
    first_name = Column(String, nullable=False)                         # User's First Name.
    last_name = Column(String, nullable=False)                          # User's Last Name.
    email = Column(String, unique=True, index=True, nullable=False)     # User's Email Address. (Unique, Indexed)
    hashed_password = Column(String, nullable=False)                    # Hashed Password. (Never Store Plain Text)
    
    # Account Status.
    is_active = Column(Boolean, default=True)               # Whether User Account Is Active.
    is_verified = Column(Boolean, default=False)            # Whether Email Has Been Verified.
    
    # Google OAuth Fields.
    google_id = Column(String, unique=True, index=True, nullable=True)      # Google User ID.
    picture = Column(String, nullable=True)                                 # Google Profile Picture URL.
    
    # Metadata.
    created_at = Column(DateTime)                           # When User Account Was Created.
    updated_at = Column(DateTime)                           # When User Account Was Last Updated.
    last_login = Column(DateTime)                           # When User Last Logged In.
    
    # Relationships.
    accounts = relationship("Account", back_populates="user")           # One-To-Many Relationship With Accounts.
    transactions = relationship("Transaction", back_populates="user")   # One-To-Many Relationship With Transactions.
    institutions = relationship("Institution", back_populates="user")   # One-To-Many Relationship With Institutions.
    file_uploads = relationship("FileUpload", back_populates="user")    # One-To-Many Relationship With File Uploads.
    tags = relationship("Tag", back_populates="user")                  # One-To-Many Relationship With Tags.

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
    tags = relationship("TransactionTag", back_populates="transaction")  # Many-To-Many Relationship With Tags.

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

# -------------------------------------------------------- Monthly Snapshot Model
class MonthlySnapshot(Base):
    __tablename__ = "monthly_snapshots" # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)  # Monthly Snapshot ID.
    user_id = Column(Integer, ForeignKey("users.id"))   # User ID.
    snapshot_date = Column(Date, index=True)            # First Day Of The Month.
    
    # Financial Metrics.
    net_worth = Column(Float, default=0.0)              # Net Worth.
    total_assets = Column(Float, default=0.0)           # Total Assets.
    total_liabilities = Column(Float, default=0.0)      # Total Liabilities.
    monthly_cash_flow = Column(Float, default=0.0)      # Monthly Cash Flow.
    monthly_income = Column(Float, default=0.0)         # Monthly Income.
    monthly_spending = Column(Float, default=0.0)       # Monthly Spending.
    transaction_count = Column(Integer, default=0)      # Number Of Transactions.

    # Metadata.
    created_at = Column(DateTime)
    
    # Relationships.
    user = relationship("User")

# -------------------------------------------------------- Weekly Centi Score Model
class WeeklyCentiScore(Base):
    __tablename__ = "weekly_centi_scores" # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)  # Weekly Centi Score ID.
    user_id = Column(Integer, ForeignKey("users.id"))   # User ID.
    score_date = Column(Date, index=True)               # Monday Of The Week.
    
    # Score Components.
    total_score = Column(Integer, default=0)            # Total Score.
    net_worth_score = Column(Integer, default=0)        # Net Worth Score.
    assets_score = Column(Integer, default=0)           # Assets Score.
    liabilities_score = Column(Integer, default=0)      # Liabilities Score.
    cash_flow_score = Column(Integer, default=0)        # Cash Flow Score.
    
    # Financial Data At Time Of Calculation.
    net_worth = Column(Float, default=0.0)              # Net Worth.
    total_assets = Column(Float, default=0.0)           # Total Assets.
    total_liabilities = Column(Float, default=0.0)      # Total Liabilities.
    monthly_cash_flow = Column(Float, default=0.0)      # Monthly Cash Flow.
    transaction_count = Column(Integer, default=0)      # Number Of Transactions.
    
    # Metadata.
    created_at = Column(DateTime, default=datetime.now())
    
    # Relationships.
    user = relationship("User")

# -------------------------------------------------------- Account Balance History Model
class AccountBalanceHistory(Base):
    __tablename__ = "account_balance_history" # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)  # Account Balance History ID.
    user_id = Column(Integer, ForeignKey("users.id"))   # User ID.
    account_id = Column(String, index=True)             # Plaid Account ID Or Null For Cash.
    snapshot_date = Column(Date, index=True)            # Date Of The Balance Snapshot.
    
    # Balance Information.
    current_balance = Column(Float, default=0.0)        # Current Balance.
    available_balance = Column(Float, default=0.0)      # Available Balance.
    limit = Column(Float, default=0.0)                  # Credit Limit If Applicable.
    
    # Account Metadata At Time Of Snapshot.
    account_name = Column(String)                       # Account Name.
    account_type = Column(String)                       # Account Type.
    account_subtype = Column(String)                    # Account Subtype.
    currency = Column(String, default="USD")            # Currency.
    
    # Metadata.
    created_at = Column(DateTime, default=datetime.now())
    
    # Relationships.
    user = relationship("User")

# -------------------------------------------------------- Tag Model
class Tag(Base):
    __tablename__ = "tags" # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)  # Tag ID.
    user_id = Column(Integer, ForeignKey("users.id"))   # User ID.
    name = Column(String, nullable=False)               # Tag Name.
    emoji = Column(String, default="🏷️")                # Default Emoji.
    color = Column(String, default="#6366f1")           # Default Color.
    is_default = Column(Boolean, default=False)         # Whether It's A System Default Tag.
    created_at = Column(DateTime, default=datetime.now()) # When Tag Was Created.
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now()) # When Tag Was Last Updated.
    
    # Relationships.
    user = relationship("User")
    transaction_tags = relationship("TransactionTag", back_populates="tag")

# -------------------------------------------------------- Transaction Tag Association Model
class TransactionTag(Base):
    __tablename__ = "transaction_tags" # Physical Table Name In Database.
    
    id = Column(Integer, primary_key=True, index=True)                              # Transaction Tag ID.
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False) # Transaction ID.
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)                 # Tag ID.
    created_at = Column(DateTime, default=datetime.now())                           # When Transaction Tag Was Created.
    
    # Relationships.
    transaction = relationship("Transaction", back_populates="tags") # Many-To-One Relationship With Transaction.
    tag = relationship("Tag", back_populates="transaction_tags") # Many-To-One Relationship With Tag.

# -------------------------------------------------------- Database Setup.
def get_database_url():
    """Get database URL from environment"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is required")
    print(f"Using DATABASE_URL: {database_url[:20]}...")
    return database_url

# -------------------------------------------------------- Create Engine Safe.
def create_engine_safe():
    """Create database engine with error handling"""
    try:
        database_url = get_database_url()
        print(f"Connecting to database: {database_url[:20]}...")  # Log partial URL for security
        
        # PostgreSQL configuration - try different drivers
        try:
            # First try with psycopg2
            engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300)
            print("Using psycopg2 driver")
        except ImportError:
            # Fallback to asyncpg if psycopg2 is not available
            try:
                import asyncpg
                # Convert asyncpg URL to SQLAlchemy format
                if database_url.startswith("postgresql://"):
                    engine = create_engine(database_url, pool_pre_ping=True, pool_recycle=300)
                    print("Using asyncpg driver")
                else:
                    raise Exception("Unsupported database URL format")
            except ImportError:
                raise Exception("Neither psycopg2 nor asyncpg are available")
        
        # Test the connection
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        
        print("Database connection successful")
        return engine
    except Exception as e:
        print(f"Database connection failed: {e}")
        print(f"Error type: {type(e).__name__}")
        print(f"Error details: {str(e)}")
        # Return None so the app can still start without database
        return None

# Initialize Engine Lazily.
engine = None
SessionLocal = None

# -------------------------------------------------------- Get Engine.
def get_engine():
    """Get or create database engine"""
    global engine
    if engine is None:
        engine = create_engine_safe()
    return engine

# -------------------------------------------------------- Get Session.
def get_session():
    """Get database session"""
    global SessionLocal
    if SessionLocal is None:
        engine = get_engine()
        if engine:
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        else:
            return None
    return SessionLocal()

# -------------------------------------------------------- Create Tables.
def create_tables():
    """Create database tables if engine is available"""
    engine = get_engine()
    if engine:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully")
        except Exception as e:
            print(f"Failed to create database tables: {e}")
    else:
        print("Skipping table creation - no database connection")
