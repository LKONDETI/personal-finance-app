from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import uuid

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Customer API", description="API for customer management with Supabase")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:8081", "http://192.168.1.183:8081", "exp://192.168.1.183:8081"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url: str = os.getenv("SUPABASE_URL")
supabase_key: str = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

# Pydantic models for request/response
class Customer(BaseModel):
    id: int  # Changed from str to int to match database
    email: EmailStr
    name: str | None = None
    phone: str | None = None
    created_at: str | None = None

class CustomerCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    phone: str | None = None

class CustomerResponse(BaseModel):
    customer: Customer | None = None

class ErrorResponse(BaseModel):
    message: str
    details: str | None = None

class LogoutResponse(BaseModel):
    success: bool
    message: str

class Account(BaseModel):
    id: int
    account_name: str
    account_number: int
    product_id: str
    currency: str
    created_at: str
    balance: float | None = None
    

class Transaction(BaseModel):
    id: int
    debit_account_number: int | None = None
    credit_account_number: int | None = None
    debit_amount: float | None = None
    credit_amount: float | None = None
    debit_currency: str | None = None
    transaction_type: str
    transaction_time: str
    accountId: int
    party_id: int | None = None



@app.get("/")
async def root():
    return {"message": "Welcome to the Customer API"}

@app.get("/customer", response_model=CustomerResponse, responses={404: {"model": ErrorResponse}})
async def get_customer(email: str):
    try:
        # Query Supabase for customer data
        response = supabase.table("customers").select("*").eq("email", email).execute()
        
        # Check if we have any data
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=404,
                detail={"message": "Customer not found", "details": f"No customer found with email: {email}"}
            )
        
        # Return the first customer found
        return {"customer": response.data[0]}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error fetching customer: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch customer data", "details": str(e)}
        )

@app.get("/customers", response_model=list[Customer])
async def get_all_customers():
    try:
        response = supabase.table("customers").select("*").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching all customers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch customers", "details": str(e)}
        )

@app.post("/logout", response_model=LogoutResponse)
async def logout():
    try:
        # In a real app, you might want to invalidate tokens or perform other cleanup
        # For this simple example, we'll just return a success message
        return {
            "success": True,
            "message": "Successfully logged out"
        }
    except Exception as e:
        print(f"Error during logout: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to logout", "details": str(e)}
        )

@app.get("/accounts", response_model=list[Account])
async def get_accounts(party_id: int = None):
    try:
        query = supabase.table("accounts").select("*")
        if party_id is not None:
            query = query.eq("party_id", party_id)
        response = query.execute()
        return response.data
    except Exception as e:
        print(f"Error fetching accounts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch accounts", "details": str(e)}
        )

@app.get("/transactions", response_model=list[Transaction])
async def get_transactions(account_id: int = None, party_id: int = None):
    try:
        query = supabase.table("transactions").select("*")
        if account_id is not None:
            query = query.eq("accountId", account_id)
        if party_id is not None:
            query = query.eq("party_id", party_id)
        response = query.execute()
        return response.data
    except Exception as e:
        print(f"Error fetching transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch transactions", "details": str(e)}
        )

@app.get("/budget-transactions", response_model=list[Transaction])
async def get_budget_transactions(party_id: int, transaction_type: str = None):
    try:
        query = supabase.table("transactions").select("*").eq("party_id", party_id)
        if transaction_type:
            query = query.eq("transaction_type", transaction_type)
        response = query.execute()
        return response.data
    except Exception as e:
        print(f"Error fetching budget transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch budget transactions", "details": str(e)}
        )

def update_account_balance(account_id: int):
    txns = supabase.table('transactions').select('*').eq('accountId', account_id).execute().data
    balance = 0
    for txn in txns:
        balance += txn.get('credit_amount', 0) or 0
        balance -= txn.get('debit_amount', 0) or 0
    supabase.table('accounts').update({'balance': balance}).eq('id', account_id).execute()
    print(f"Updated account {account_id} balance to {balance}")

@app.post("/transactions")
async def add_transaction(transaction: Transaction):
    try:
        supabase.table("transactions").insert(transaction.dict()).execute()
        update_account_balance(transaction.accountId)
        return {"success": True}
    except Exception as e:
        print(f"Error adding transaction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to add transaction", "details": str(e)}
        )

@app.get("/customers/{customer_id}")
async def get_customer_by_id(customer_id: int):
    try:
        response = supabase.table("customers").select("*").eq("id", customer_id).execute()
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        return response.data[0]
    except Exception as e:
        print(f"Error fetching customer by id: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch customer")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 