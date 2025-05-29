from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DB_PATH = "transactions.db"
DATABASE_URL = f"sqlite:///./{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    vendor = Column(String)
    description = Column(String)
    amount = Column(Float)
    type = Column(String)
    file = Column(String)

class UploadedFile(Base):
    __tablename__= "uploaded_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    num_transactions = Column(Integer)
    notes = Column(String, nullable=True)
    content_hash = Column(String)

Base.metadata.create_all(bind=engine)
