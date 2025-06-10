# Imports.
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException

# Plaid Imports.
import plaid
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

# Local Imports.
from app.config import plaid_config
from app.database import SessionLocal, Transaction
from app.models import LinkTokenRequest, PublicTokenExchangeRequest, LinkTokenResponse, AccessTokenResponse

router = APIRouter(prefix="/plaid", tags=["plaid"])     # Sets Up Modular Sub-Router For FastAPI.

# ----------------------------------------------------------------------- Creates Plaid Link Token.
@router.post("/create_link_token", response_model=LinkTokenResponse)
async def create_link_token(request: LinkTokenRequest):
    try:
        # Initialize Empty Product List, Then Build List Of Products Requested.
        products = []
        for product in plaid_config.products:                   
            if product.strip() == 'transactions':
                products.append(Products('transactions'))
            elif product.strip() == 'auth':
                products.append(Products('auth'))
        
        # Create Country Codes List.
        country_codes = [CountryCode(code.strip()) for code in plaid_config.country_codes]
        
        # Construct Request W/ Attributes.
        link_request = LinkTokenCreateRequest(
            products=products,
            client_name="Centi.",
            country_codes=country_codes,
            language='en',
            user=LinkTokenCreateRequestUser(client_user_id=request.user_id)
        )
        
        # Call Plaids API W/ Request.
        response = plaid_config.client.link_token_create(link_request)

        # Return Token To Frontend.
        return LinkTokenResponse(link_token=response['link_token'])
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating link token: {str(e)}")

# ----------------------------------------------------------------------- Exchange Frontend Token For Access Token.
@router.post("/exchange_public_token", response_model=AccessTokenResponse)
async def exchange_public_token(request: PublicTokenExchangeRequest):
    try:
        # Build Plaid Exchange Request W/ Public Token.
        exchange_request = ItemPublicTokenExchangeRequest(
            public_token=request.public_token
        )
        
        # Call Plaids Secure Exchange.
        response = plaid_config.client.item_public_token_exchange(exchange_request)
        
        # Returns Access Token To Frontend.
        return AccessTokenResponse(
            access_token=response['access_token'],
            item_id=response['item_id']
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exchanging token: {str(e)}")

# ----------------------------------------------------------------------- Fetches Transactions From Access Token.
@router.post("/fetch_transactions/{access_token}")
async def fetch_transactions(access_token: str):
    try:
        # Set Dates For Transactions Timeframe.
        start_date = datetime.now() - timedelta(days=30)
        end_date = datetime.now()
        
        # Create Request Based on Timeframe.
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date.date(),
            end_date=end_date.date()
        )
        
        # Get Response From Request Of Transactions.
        response = plaid_config.client.transactions_get(request)

        # Sets Transactions As A List.
        transactions = response['transactions']
        
        # Store Set Transactions In Database.
        db = SessionLocal()

        # Initialize Count Of Transactions To 0.
        stored_count = 0
        
        try:
            # Per Transaction , 
            for tx in transactions:
                # Check If The Transaction Already Exists ,
                existing = db.query(Transaction).filter(
                    Transaction.vendor == tx['merchant_name'] or tx['name'],
                    Transaction.amount == -tx['amount'],
                    Transaction.date == tx['date']
                ).first()
                
                # If It Doesn't ,
                if not existing:
                    # Create New Transaction From Data.
                    new_transaction = Transaction(
                        date=tx['date'],
                        vendor=tx['merchant_name'] or tx['name'],
                        description=tx['name'],
                        amount=-tx['amount'],  # Convert Plaid convention to your convention
                        type=tx['category'][0] if tx['category'] else 'other',
                        file='plaid'
                    )

                    # Add To Database.
                    db.add(new_transaction)

                    # Increment Stored Count.
                    stored_count += 1
            
            # Commit To Database.
            db.commit()
            
        finally:
            # At End Of Try, Close Database Connection.
            db.close()
        
        # Return Success Message W/ Total Amount Of Transactions & New Transactions. 
        return {
            "message": f"Successfully fetched and stored {stored_count} new transactions",
            "total_fetched": len(transactions),
            "new_transactions": stored_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching transactions: {str(e)}")

# ----------------------------------------------------------------------- Fetches Accounts From Access Token,
@router.get("/accounts/{access_token}")
async def get_accounts(access_token: str):
    try:
        # Create Account Request Using Token.
        request = AccountsGetRequest(access_token=access_token)

        # Get Response From Plaid API.
        response = plaid_config.client.accounts_get(request)
        
        # Initialize Empty List For Accounts.
        accounts = []
        
        # Per Account, 
        for account in response['accounts']:
            # Add To Account List.
            accounts.append({
                "account_id": account['account_id'],
                "name": account['name'],
                "type": account['type'],
                "subtype": account['subtype'],
                "balance": account['balances']['current']
            })
        
        # Return Account List.
        return {"accounts": accounts}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching accounts: {str(e)}") 