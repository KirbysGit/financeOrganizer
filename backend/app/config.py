# Imports.
import os
import plaid
from dotenv import load_dotenv
from plaid.api import plaid_api
from plaid.api_client import ApiClient
from plaid.configuration import Configuration

# Load .env Variables.
load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance_organizer.db")
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # Plaid
    PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
    PLAID_SECRET = os.getenv("PLAID_SECRET")
    PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()

# Plaid Configuration.
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")  # sandbox, development, production

# Plaid Data Retrieval Settings
PLAID_TRANSACTION_DAYS = int(os.getenv("PLAID_TRANSACTION_DAYS", "30"))  # Default 30 days for sandbox

# Plaid Config Set Up.
class PlaidConfig:
    def __init__(self):
        # Set Client ID, Secret, env, Products, & Country Codes.
        self.client_id = os.getenv('PLAID_CLIENT_ID')
        self.secret = os.getenv('PLAID_SECRET')
        self.env = os.getenv('PLAID_ENV', 'sandbox').lower()
        self.products = os.getenv('PLAID_PRODUCTS', 'transactions,auth').split(',')
        self.country_codes = os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')
        
        # Validate Required Config.
        if not self.client_id or not self.secret:
            raise ValueError("PLAID_CLIENT_ID and PLAID_SECRET must be set in environment variables")
        
        # Set Plaid Env.
        if self.env == 'sandbox':
            host = plaid.Environment.Sandbox
        elif self.env == 'development':
            host = plaid.Environment.Development
        elif self.env == 'production':
            host = plaid.Environment.Production
        else:
            raise ValueError(f"Invalid PLAID_ENV: {self.env}. Must be 'sandbox', 'development', or 'production'")
        
        # Configure Plaid Client.
        configuration = Configuration(
            host=host,
            api_key={
                'clientId': self.client_id,
                'secret': self.secret
            }
        )

        # Create A Low Level API Client From Our Config.
        api_client = ApiClient(configuration)

        # Create A Plaid API Client Based On Our API Client.
        self.client = plaid_api.PlaidApi(api_client)

# Google OAuth Config Set Up.
class GoogleConfig:
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        
        # Validate Required Config.
        if not self.client_id or not self.client_secret:
            raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables")

# Create global instances
plaid_config = PlaidConfig()
google_config = GoogleConfig() 