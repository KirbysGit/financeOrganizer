# Config File For The Backend.


# Imports.
import os
import secrets
import plaid
from dotenv import load_dotenv
from plaid.api import plaid_api
from plaid.api_client import ApiClient
from plaid.configuration import Configuration

# Load .env Variables.
load_dotenv()

# -------------------------------------------------------- Secret Resolution.
# Single source of truth for JWT signing secrets. Previously these were
# hard-coded literals scattered across routes/utils (and committed to a public
# repo), which meant anyone could forge session or verification tokens.
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
ALGORITHM = "HS256"

def _resolve_secret(env_var, fallback=None):
    """Resolve a signing secret from the environment.

    - If the env var is set, use it.
    - In production, fail fast when it is missing (never fall back to a known
      default key).
    - In development, use `fallback` if given, else generate a random ephemeral
      key so local runs work out-of-the-box (sessions reset on restart).
    """
    value = os.getenv(env_var)
    if value:
        return value
    if fallback:
        return fallback
    if ENVIRONMENT == "production":
        raise RuntimeError(
            f"{env_var} environment variable is required in production. "
            f"Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    print(
        f"⚠️  {env_var} not set — using a random ephemeral key for development "
        f"(sessions reset on restart). Set {env_var} in your .env for stable sessions."
    )
    return secrets.token_urlsafe(64)

# Primary JWT signing secret (auth/session tokens).
SECRET_KEY = _resolve_secret("SECRET_KEY")
# Secret for email verification / password-reset tokens. Falls back to the
# primary SECRET_KEY if a dedicated one isn't provided.
VERIFICATION_SECRET_KEY = _resolve_secret("VERIFICATION_SECRET_KEY", fallback=SECRET_KEY)

# -------------------------------------------------------- Settings.
class Settings:
    # Database.
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # JWT. (Secret resolved above from environment; prod-required.)
    SECRET_KEY = SECRET_KEY
    ALGORITHM = ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # Plaid.
    PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
    PLAID_SECRET = os.getenv("PLAID_SECRET")
    PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")
    
    # Environment.
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS.
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()

# -------------------------------------------------------- Plaid Configuration.
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")  # sandbox, development, production

# Plaid Data Retrieval Settings
PLAID_TRANSACTION_DAYS = int(os.getenv("PLAID_TRANSACTION_DAYS", "90"))  # Default 90 days for production

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
            print("🔧 Plaid: Using SANDBOX environment")
        elif self.env == 'development':
            host = plaid.Environment.Development
            print("🔄 Plaid: Using DEVELOPMENT environment")
        elif self.env == 'production':
            host = plaid.Environment.Production
            print("🚀 Plaid: Using PRODUCTION environment")
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
        
        # Log configuration details
        print(f"📊 Plaid Config: Environment={self.env}, Products={self.products}, Countries={self.country_codes}")

# -------------------------------------------------------- Google OAuth Config Set Up.
class GoogleConfig:
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        
        # Validate Required Config.
        if not self.client_id or not self.client_secret:
            raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables")

# Create Global Instances.
plaid_config = PlaidConfig()
google_config = GoogleConfig() 