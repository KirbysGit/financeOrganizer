from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, transactions

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8000",  # Alternative React dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(transactions.router)