# Imports.
import os
import plaid
from dotenv import load_dotenv
from plaid.api import plaid_api
from plaid.api_client import ApiClient
from plaid.configuration import Configuration

# Load .env Variables.
load_dotenv()

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

# Create global instance
plaid_config = PlaidConfig() 