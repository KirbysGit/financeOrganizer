# Main File For The Backend.
#
# Note : This File Is The Entry Point For The Backend. 
#        Also, need to clear up all the health check endpoints I used for dev.
#
# Functions :
#   - 'app' - FastAPI Instance.
#   - 'startup_event' - Startup Event.


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
    'https://financeorganizer.vercel.app',  # Alternative Vercel domain
    'https://centi-dev.vercel.app',  # Another possible domain
    'https://centi.dev',  # Another possible domain
    'https://www.centi.dev',  # Another possible domain
]

# Add Any Railway-Specific Origins.
railway_origin = os.getenv('RAILWAY_STATIC_URL')
if railway_origin:
    cleaned = railway_origin.strip().rstrip(';')  # Remove any trailing semicolons or whitespace
    if cleaned not in origins:
        origins.append(cleaned)

# Adds The Middleware For CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache Preflight For 24 Hours.
)

# Add Specific CORS Handler For Auth Routes To Handle Railway Proxy Issues.
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

# -------------------------------------------------------- Test Endpoints.
@app.get("/test-simple")
async def test_simple():
    """Simple test endpoint with no dependencies"""
    return {
        "message": "Simple test successful",
        "timestamp": "2024-01-01",
        "port": os.getenv('PORT', 'Not set'),
        "environment": os.getenv('ENVIRONMENT', 'development')
    }

# -------------------------------------------------------- Root Endpoint.
@app.get("/")
async def root():
    return {"message": "Finance Organizer API is running!", "status": "healthy"}

# -------------------------------------------------------- Health Check Endpoint.
@app.get("/health")
async def health_check():
    return {"status": "healthy", "cors_origins": origins}

# -------------------------------------------------------- Debug Auth Endpoint.
@app.get("/debug-auth")
async def debug_auth(request: Request):
    """Debug endpoint to check authentication and CORS"""
    return {
        "status": "debug",
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
        "origin": request.headers.get("origin"),
        "cors_origins": origins
    }

# -------------------------------------------------------- Ping Endpoint.
@app.get("/ping")
async def ping():
    return {"message": "pong", "timestamp": "2024-01-01", "status": "running"}

# -------------------------------------------------------- Simple Health Endpoint.
@app.get("/simple-health")
async def simple_health():
    """Simple health check without CORS requirements"""
    return {"status": "ok", "service": "finance-organizer-api"}

# -------------------------------------------------------- Test Endpoint.
@app.get("/test")
async def test():
    return {"message": "FastAPI is running!", "routes": ["/", "/health", "/ping", "/test", "/auth/register"]}

# -------------------------------------------------------- CORS Test Endpoint.
@app.get("/cors-test")
async def cors_test():
    return {"message": "CORS test successful", "timestamp": "2024-01-01"}

# -------------------------------------------------------- CORS Test Options Endpoint.
@app.options("/cors-test")
async def cors_test_options():
    return {"message": "CORS preflight test successful"}

# -------------------------------------------------------- Auth CORS Test Endpoint.
@app.get("/auth/cors-test")
async def auth_cors_test():
    return {"message": "Auth CORS test successful", "timestamp": "2024-01-01"}

# -------------------------------------------------------- Auth CORS Test Options Endpoint.
@app.options("/auth/cors-test")
async def auth_cors_test_options():
    return {"message": "Auth CORS preflight test successful"}

# -------------------------------------------------------- Startup Event.
# Start The Centi Score Scheduler Only When App Starts.
@app.on_event("startup")
async def startup_event():
    try:
        # Initialize Database Tables.
        from app.database import create_tables
        create_tables()
        
        # Start Scheduler.
        from app.utils.scheduler import start_scheduler
        start_scheduler()
        
    except Exception as e:
        print(f"Failed to start application: {e}")
        import traceback
        traceback.print_exc()
        # Don't Fail The App If Startup Fails.