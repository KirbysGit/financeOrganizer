# Imports.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Local Imports.
from app.routes import upload, transactions, files, plaid, accounts, centi_score

# Create Instance Of FastAPI Application.
app = FastAPI(
    title="Centi API",
    description="Backend API for Centi App",
    version="1.0.0"
)

# Configure CORS.
origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "https://your-frontend-domain.vercel.app",  # Replace with your actual domain
    "https://finance-organizer.vercel.app",     # Example domain
]

# Adds The Middleware For CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Modular Route Groups.
app.include_router(files.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(plaid.router)
app.include_router(accounts.router)
app.include_router(centi_score.router)

# Start The Centi Score Scheduler.
from app.utils.scheduler import start_scheduler

start_scheduler()

@app.get("/")
async def root():
    return {"message": "Finance Organizer API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}