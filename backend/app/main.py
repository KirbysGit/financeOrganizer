# Main File For The Backend.
#
# Note : This File Is The Entry Point For The Backend. Dev-only debug/test
#        endpoints have been removed for production; only "/" and "/health"
#        remain as public liveness probes.
#
# Functions :
#   - 'app' - FastAPI Instance.
#   - 'startup_event' - Startup Event.


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

# Force HTTPS in production - but be more careful with Railway
if os.getenv('ENVIRONMENT') == 'production':
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    
    # Trust Railway's proxy headers
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["*"]  # Allow all hosts in production for now
    )
    
    # Don't force HTTPS redirects in Railway - let Railway handle it
    # The HTTPSRedirectMiddleware was causing 307 redirects that broke the frontend

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
    """Handle CORS preflight for auth route specifically"""
    return {"message": "CORS preflight handled for auth route"}

# Add Specific CORS Handler For Files Routes To Handle Railway Proxy Issues.
@app.options("/files/{path:path}")
async def files_cors_handler(path: str):
    """Handle CORS preflight for files routes specifically"""
    return {"message": "CORS preflight handled for files route"}

@app.options("/files/")
async def files_root_cors_handler():
    """Handle CORS preflight for files root route specifically"""
    return {"message": "CORS preflight handled for files root route"}

# Register Modular Route Groups.
app.include_router(files.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(plaid.router)
app.include_router(accounts.router)
app.include_router(centi_score.router)

# -------------------------------------------------------- Root Endpoint.
@app.get("/")
async def root():
    return {"message": "Centi API is running!", "status": "healthy"}

# -------------------------------------------------------- Health Check Endpoint.
# Lightweight liveness probe for uptime monitors / Railway. Intentionally
# returns no internal config (allowed origins, request headers, cookies) so
# deployment details are never leaked to unauthenticated callers.
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# -------------------------------------------------------- Startup Event.
# Start The Centi Score Scheduler Only When App Starts.
@app.on_event("startup")
async def startup_event():
    try:
        print("Starting Finance Organizer API...")
        
        # Check database connection first
        from app.database import get_engine, get_database_url
        database_url = get_database_url()
        print(f"Database URL: {database_url[:20]}..." if database_url else "No database URL set")
        
        engine = get_engine()
        if engine is None:
            print("WARNING: Database engine is None - database connection failed!")
            print("The app will start but database operations will fail")
        else:
            print("Database engine created successfully")
        
        # Initialize Database Tables.
        from app.database import create_tables
        create_tables()
        
        # Start Scheduler.
        from app.utils.scheduler import start_scheduler
        start_scheduler()
        
        print("Finance Organizer API started successfully!")
        
    except Exception as e:
        print(f"Failed to start application: {e}")
        import traceback
        traceback.print_exc()
        # Don't Fail The App If Startup Fails.


