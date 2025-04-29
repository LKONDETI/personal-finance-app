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
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
    # add other fields as needed

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
async def get_accounts():
    try:
        response = supabase.table("accounts").select("*").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching accounts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch accounts", "details": str(e)}
        )

@app.get("/transactions", response_model=list[Transaction])
async def get_transactions(account_id: int):
    try:
        response = supabase.table("transactions").select("*").eq("accountId", account_id).execute()
        print("Transactions data:", response.data)  # Debug log
        return response.data
    except Exception as e:
        print(f"Error fetching transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to fetch transactions", "details": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 