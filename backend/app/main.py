# Imports.
from fastapi import FastAPI, Request
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
    'http://localhost:5173',
    'http://localhost:8000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
    'https://finance-organizer-wine.vercel.app',  # Replace with your actual Vercel domain
]

print(f"CORS Origins: {origins}")  # Clean origins list

# Adds The Middleware For CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight for 24 hours
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Origin: {request.headers.get('origin', 'No origin')}")
    print(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    return response

# Register Modular Route Groups.
app.include_router(files.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(plaid.router)
app.include_router(accounts.router)
app.include_router(centi_score.router)

@app.get("/")
async def root():
    return {"message": "Finance Organizer API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Start The Centi Score Scheduler only when app starts
@app.on_event("startup")
async def startup_event():
    try:
        # Initialize database tables
        from app.database import create_tables
        create_tables()
        
        # Start scheduler
        from app.utils.scheduler import start_scheduler
        start_scheduler()
        print("Scheduler started successfully")
    except Exception as e:
        print(f"Failed to start scheduler: {e}")
        # Don't fail the app if scheduler fails