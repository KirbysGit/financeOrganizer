# Imports.
import time
import json
import asyncio
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
from app.database import SessionLocal, Transaction, Account, Institution
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
               
        # Store Institution In Database.
        db = SessionLocal()

        try:
            # Check If Institution Already Exists.
            existing_institution = db.query(Institution).filter(
                Institution.item_id == response['item_id']
            ).first()
            
            # If It Doesn't Exist, Create New Institution Item, Then Add To Database.
            if not existing_institution:
                new_institution = Institution(
                    item_id=response['item_id'],
                    access_token=response['access_token'],
                    is_connected=True,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(new_institution)
                db.commit()
            else:
                # Update Existing Connection.
                existing_institution.access_token = response['access_token']
                existing_institution.is_connected = True
                existing_institution.updated_at = datetime.now()
                db.commit()
        finally:
            # Close Database After.
            db.close()
        
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
    # Set Var For Max Retries Per Connection.
    max_retries = 5

    # Set Var For Delay Between Retry Per Connection.
    base_delay = 2 
    
    # While Under Amount Of Max Retries.
    for attempt in range(max_retries):
        try:
            # Calculate Date Range.
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            
            # Create Transaction Request.
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date
            )
            
            # Attempt To Fetch Transactions.
            response = plaid_config.client.transactions_get(request)
            
            # Process And Store Accounts First.
            db = SessionLocal()
            try:
                # Get Account Data.
                accounts_data = response.get('accounts', [])

                # Set Stored Accounts To 0 (Pre-Processed Accounts).
                stored_accounts = 0

                # Per Account,
                for account in accounts_data:

                    # Grab Account ID.
                    account_id = getattr(account, 'account_id', None)
                    if not account_id:
                        continue
                        
                    # Check If Account Already Exists.
                    existing_account = db.query(Account).filter(
                        Account.account_id == account_id
                    ).first()
                    
                    # Get Balances From Account.
                    balances = getattr(account, 'balances', None)
                    
                    # Convert Plaid Enum Objects To String Values.
                    account_type = getattr(account, 'type', None)
                    account_subtype = getattr(account, 'subtype', None)
                    
                    # Convert Enum Objects To String Values.
                    type_str = str(account_type.value) if hasattr(account_type, 'value') else str(account_type) if account_type else None
                    subtype_str = str(account_subtype.value) if hasattr(account_subtype, 'value') else str(account_subtype) if account_subtype else None
                    
                    # Create New Account, Add To Database, Then Increment Stored Accounts.
                    if not existing_account:
                        new_account = Account(
                            account_id=account_id,
                            name=getattr(account, 'name', None),
                            official_name=getattr(account, 'official_name', None),
                            type=type_str,
                            subtype=subtype_str,
                            mask=getattr(account, 'mask', None),
                            current_balance=getattr(balances, 'current', None) if balances else None,
                            available_balance=getattr(balances, 'available', None) if balances else None,
                            limit=getattr(balances, 'limit', None) if balances else None,
                            currency=getattr(balances, 'iso_currency_code', 'USD') if balances else 'USD',
                            is_active=True,
                            created_at=datetime.now(),
                            updated_at=datetime.now()
                        )
                        db.add(new_account)
                        stored_accounts += 1
                    else:
                        # Update Existing Account Balances.
                        if balances:
                            existing_account.current_balance = getattr(balances, 'current', existing_account.current_balance)
                            existing_account.available_balance = getattr(balances, 'available', existing_account.available_balance)
                            existing_account.updated_at = datetime.now()
                
                # Commit Account Changes To Database.
                db.commit()
                
                # Process Transactions.
                transactions = response['transactions']
                
                # Set Stored Count To 0 (Pre-Processed Transactions).
                stored_count = 0
                
                # Per Transaction,
                for i, tx in enumerate(transactions):
                    
                    # Get Transaction Attributes Safely.
                    transaction_id = getattr(tx, 'transaction_id', None)
                    account_id = getattr(tx, 'account_id', None)
                    merchant_name = getattr(tx, 'merchant_name', None)
                    name = getattr(tx, 'name', 'Unknown')
                    amount = getattr(tx, 'amount', 0)
                    date = getattr(tx, 'date', None)
                    category = getattr(tx, 'category', None)
                    transaction_type = getattr(tx, 'transaction_type', None)
                    
                    # Convert Transaction Type Enum To String If Needed.
                    transaction_type_str = str(transaction_type.value) if hasattr(transaction_type, 'value') else str(transaction_type) if transaction_type else None
                    
                    # Skip If No Transaction ID.
                    if not transaction_id:
                        continue
                    
                    # Check If Transaction Already Exists.
                    existing = db.query(Transaction).filter(
                        Transaction.transaction_id == transaction_id
                    ).first()
                    
                    # If Transaction Doesn't Exist,
                    if not existing:
                        
                        # Extract Location Data.
                        location = getattr(tx, 'location', None)
                        location_address = getattr(location, 'address', None) if location else None
                        location_city = getattr(location, 'city', None) if location else None
                        location_state = getattr(location, 'region', None) if location else None
                        location_country = getattr(location, 'country', None) if location else None
                        
                        # Extract Payment Metadata.
                        payment_meta = getattr(tx, 'payment_meta', None)
                        payment_reference = getattr(payment_meta, 'reference_number', None) if payment_meta else None
                        payment_method = getattr(payment_meta, 'payment_method', None) if payment_meta else None
                        
                        # Create New Transaction With Enhanced Data.
                        new_transaction = Transaction(
                            transaction_id=transaction_id,
                            account_id=account_id,
                            date=date,
                            amount=-amount,  # Convert Plaid Convention (Negative = Expense).
                            vendor=merchant_name or name,
                            merchant_name=merchant_name,
                            description=name,
                            category_primary=category[0] if category and len(category) > 0 else 'other',
                            category_detailed=', '.join(category) if category else None,
                            transaction_type=transaction_type_str,
                            source='plaid',
                            file='plaid',
                            iso_currency_code=getattr(tx, 'iso_currency_code', 'USD'),
                            location_address=location_address,
                            location_city=location_city,
                            location_state=location_state,
                            location_country=location_country,
                            payment_reference=payment_reference,
                            payment_method=payment_method,
                            created_at=datetime.now(),
                            updated_at=datetime.now()
                        )
                        
                        try:
                            # Add Transaction To Database.
                            db.add(new_transaction)
                            # Increment Stored Count.
                            stored_count += 1
                        except Exception as e:
                            if "UNIQUE constraint failed" in str(e):
                                # Transaction hash already exists, Move On.
                                continue
                            else:
                                raise e
                
                # Commit Transaction Changes To Database.
                db.commit()
                
                # Return Success Response.
                return {
                    "message": f"Successfully fetched and stored {stored_count} new transactions and {stored_accounts} new accounts",
                    "total_fetched": len(transactions),
                    "new_transactions": stored_count,
                    "new_accounts": stored_accounts,
                    "attempts": attempt + 1
                }
                
            finally:
                # Close Database Connection.
                db.close()
                
        except Exception as e:
            # Convert Error To String.
            error_str = str(e)
            
            # Check If This Is A PRODUCT_NOT_READY Error.
            if "PRODUCT_NOT_READY" in error_str:
                
                # If Not The Last Attempt,
                if attempt < max_retries - 1:
                    
                    # Calculate Delay With Exponential Backoff.
                    delay = base_delay * (2 ** attempt)
                    
                    # Wait Before Retrying.
                    await asyncio.sleep(delay)
                    continue
                else:
                    # Last Attempt Failed - Return Processing Status.
                    raise HTTPException(
                        status_code=202,  # Accepted - Processing.
                        detail={
                            "error": "PRODUCT_NOT_READY",
                            "message": "Transaction data is still being processed by your bank. "
                                     "This is normal in sandbox mode. Please try again in a few minutes.",
                            "retry_after": 60,  # Seconds.
                            "attempts": max_retries
                        }
                    )
            else:
                # Different Error, Don't Retry.
                raise HTTPException(status_code=400, detail=f"Error fetching transactions: {error_str}")
    
    # This Shouldn't Be Reached, But Just In Case.
    raise HTTPException(status_code=500, detail="Unexpected error in retry logic")

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
        for i, account in enumerate(response['accounts']):
    
            # Detailed Balance Information.
            balances = getattr(account, 'balances', None)
            
            # Add To Account List.
            accounts.append({
                "account_id": getattr(account, 'account_id', None),
                "name": getattr(account, 'name', None),
                "official_name": getattr(account, 'official_name', None),
                "type": getattr(account, 'type', None),
                "subtype": getattr(account, 'subtype', None),
                "mask": getattr(account, 'mask', None),
                "balance": getattr(balances, 'current', None) if balances else None,
                "available_balance": getattr(balances, 'available', None) if balances else None,
                "limit": getattr(balances, 'limit', None) if balances else None,
                "currency": getattr(balances, 'iso_currency_code', None) if balances else None
            })
        
        # Return Account List.
        return {"accounts": accounts}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching accounts: {str(e)}") 