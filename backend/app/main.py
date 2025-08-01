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
    'https://finance-organizer-wine.vercel.app',  # Vercel frontend
    'https://financeorganizer-production.up.railway.app',  # Railway domain
]

# Add any Railway-specific origins
railway_origin = os.getenv('RAILWAY_STATIC_URL')
if railway_origin:
    cleaned = railway_origin.strip().rstrip(';')  # Remove any trailing semicolons or whitespace
    if cleaned not in origins:
        origins.append(cleaned)

# Adds The Middleware For CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use the defined origins instead of wildcard
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight for 24 hours
)

# Add specific CORS handler for auth routes to handle Railway proxy issues
@app.options("/auth/{path:path}")
async def auth_cors_handler(path: str):
    """Handle CORS preflight for auth routes specifically"""
    return {"message": "CORS preflight handled for auth route"}

# Register Modular Route Groups.
app.include_router(files.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(plaid.router)
app.include_router(accounts.router)
app.include_router(centi_score.router)

@app.get("/test-simple")
async def test_simple():
    """Simple test endpoint with no dependencies"""
    return {
        "message": "Simple test successful",
        "timestamp": "2024-01-01",
        "port": os.getenv('PORT', 'Not set'),
        "environment": os.getenv('ENVIRONMENT', 'development')
    }

@app.get("/")
async def root():
    return {"message": "Finance Organizer API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "cors_origins": origins}

@app.get("/ping")
async def ping():
    return {"message": "pong", "timestamp": "2024-01-01", "status": "running"}

@app.get("/simple-health")
async def simple_health():
    """Simple health check without CORS requirements"""
    return {"status": "ok", "service": "finance-organizer-api"}

@app.get("/test")
async def test():
    return {"message": "FastAPI is running!", "routes": ["/", "/health", "/ping", "/test", "/auth/register"]}

@app.get("/cors-test")
async def cors_test():
    return {"message": "CORS test successful", "timestamp": "2024-01-01"}

@app.options("/cors-test")
async def cors_test_options():
    return {"message": "CORS preflight test successful"}

@app.get("/auth/cors-test")
async def auth_cors_test():
    return {"message": "Auth CORS test successful", "timestamp": "2024-01-01"}

@app.options("/auth/cors-test")
async def auth_cors_test_options():
    return {"message": "Auth CORS preflight test successful"}

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
        
    except Exception as e:
        print(f"Failed to start application: {e}")
        import traceback
        traceback.print_exc()
        # Don't fail the app if startup fails