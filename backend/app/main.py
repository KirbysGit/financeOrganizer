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
    print(f"Raw RAILWAY_STATIC_URL: '{railway_origin}'")
    cleaned = railway_origin.strip().rstrip(';')  # Remove any trailing semicolons or whitespace
    print(f"Cleaned RAILWAY_STATIC_URL: '{cleaned}'")
    if cleaned not in origins:
        origins.append(cleaned)
        print(f"Added cleaned origin: '{cleaned}'")
    else:
        print(f"Origin already exists: '{cleaned}'")
else:
    print("RAILWAY_STATIC_URL not set")

print("CORS Origins:")
for i, origin in enumerate(origins, 1):
    print(f"  {i}. {origin}")
print(f"PORT environment variable: {os.getenv('PORT', 'Not set')}")
print(f"Railway should be using port: {os.getenv('PORT', '8080')}")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'sqlite:///./finance_organizer.db')[:20]}...")

# Add more detailed environment variable logging
print(f"ENVIRONMENT: {os.getenv('ENVIRONMENT', 'Not set')}")
print(f"RAILWAY_PROJECT_NAME: {os.getenv('RAILWAY_PROJECT_NAME', 'Not set')}")
print(f"RAILWAY_SERVICE_NAME: {os.getenv('RAILWAY_SERVICE_NAME', 'Not set')}")

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
    print(f"Handling CORS preflight for auth route: /auth/{path}")
    return {"message": "CORS preflight handled for auth route"}

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Origin: {request.headers.get('origin', 'No origin')}")
    print(f"User-Agent: {request.headers.get('user-agent', 'No user-agent')}")
    print(f"X-Forwarded-For: {request.headers.get('x-forwarded-for', 'No X-Forwarded-For')}")
    print(f"X-Forwarded-Proto: {request.headers.get('x-forwarded-proto', 'No X-Forwarded-Proto')}")
    print(f"Headers: {dict(request.headers)}")
    
    # Special handling for OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        print("=== CORS PREFLIGHT REQUEST ===")
        print(f"Request origin: {request.headers.get('origin')}")
        print(f"Request method: {request.headers.get('access-control-request-method')}")
        print(f"Request headers: {request.headers.get('access-control-request-headers')}")
        print(f"Requested URL: {request.url}")
    
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    
    # Special logging for CORS responses
    if request.method == "OPTIONS":
        print("=== CORS PREFLIGHT RESPONSE ===")
        print(f"Access-Control-Allow-Origin: {response.headers.get('access-control-allow-origin', 'NOT SET')}")
        print(f"Access-Control-Allow-Methods: {response.headers.get('access-control-allow-methods', 'NOT SET')}")
        print(f"Access-Control-Allow-Headers: {response.headers.get('access-control-allow-headers', 'NOT SET')}")
        print(f"Access-Control-Allow-Credentials: {response.headers.get('access-control-allow-credentials', 'NOT SET')}")
    
    return response

# Register Modular Route Groups.
app.include_router(files.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(plaid.router)
app.include_router(accounts.router)
app.include_router(centi_score.router)

# Debug: Print all registered routes
print("Registered routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        print(f"  {route.methods} {route.path}")

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
        print("Starting application...")
        print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
        print(f"PORT environment variable: {os.getenv('PORT', 'Not set')}")
        print(f"Expected binding: 0.0.0.0:{os.getenv('PORT', '8080')}")
        print("CORS Origins:")
        for i, origin in enumerate(origins, 1):
            print(f"  {i}. '{origin}'")
        
        # Initialize database tables
        from app.database import create_tables
        create_tables()
        print("Database tables created successfully")
        
        # Start scheduler
        from app.utils.scheduler import start_scheduler
        start_scheduler()
        print("Scheduler started successfully")
        
        print("Application startup complete!")
    except Exception as e:
        print(f"Failed to start application: {e}")
        import traceback
        traceback.print_exc()
        # Don't fail the app if startup fails