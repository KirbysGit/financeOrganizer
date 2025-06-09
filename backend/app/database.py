# Note : These Defines Actual Database Schemas.

# Imports.
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, func

# Sets Database Path In App.
DB_PATH = "transactions.db"

# Create Database URL From 'DB_Path'.
DATABASE_URL = f"sqlite:///./{DB_PATH}"

# Creates Connection Engine To Database.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Creates Factory For New Database Sessions.
SessionLocal = sessionmaker(bind=engine)

# Creates Base Class For All Models.
Base = declarative_base()

# Transaction Model.
# Id - Date - Vendor - Description - Amount - Type - File.
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    vendor = Column(String)
    description = Column(String)
    amount = Column(Float)
    type = Column(String)
    file = Column(String)

# UploadedFile Model.
# Id - Filename - Uploaded At - Num Transactions - Notes - Content Hash.
class UploadedFile(Base):
    __tablename__= "uploaded_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    num_transactions = Column(Integer)
    notes = Column(String, nullable=True)
    content_hash = Column(String)

# Collects All Model Definitions Then Creates Actual Tables In Database From Said Models.
Base.metadata.create_all(bind=engine)
