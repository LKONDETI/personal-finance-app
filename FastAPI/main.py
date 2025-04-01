from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import smtplib
from email.message import EmailMessage
from supabase import create_client
from datetime import datetime, timedelta

#import supabase
#import os
#import stripe
#from fastapi import FastAPI, HTTPException, Request
#from pydantic import BaseModel


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only. In production, specify your domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_ADDRESS= 'slotapplicationtest@gmail.com'
EMAIL_PASSWORD= 'zrlp nxlm nggx lfro'
SUPABASE_URL = 'https://wbzryejjnycaxvnzynhm.supabase.co';
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndienJ5ZWpqbnljYXh2bnp5bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4ODQwMTAsImV4cCI6MjAyMzQ2MDAxMH0.h7LIX7BcKIb-taVwSjMXTDSScJIjVPoQYAShXojO7gg';



"""
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")"""

supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

#stripe.api_key = "sk_test_51QwANIP4NUHk50KNK2xOMFmEcya8UU4EsW0n2ukiW1q5hmL9KquJW9n22eUB01yWbMi92txHbd4NJuECZEjpLzCb00YEr4uKac"

# @app.get("/")
# def read_root():
#     return {"message": "Hello from FastAPI"}

@app.get("/partner/availability/{partnerId}")
def get_availability(partnerId):
    response = supabase_client.table("provider_availability").select("*").eq("provider_number", partnerId).execute()
    return response.data

@app.get("/partner/availability/{partnerId}/{date}")
def get_availability(partnerId, date):
    response = supabase_client.table("provider_availability").select("*").eq("provider_number", partnerId).eq("provider_availability_date", date).execute()
    return response.data

@app.get("/partner")
def get_partners():
    try:
        response = supabase_client.table("partner").select("*").execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

@app.get("/appointments")
def get_appointments():
    try:
        response = supabase_client.table("appointment").select("*").execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

@app.get("/appointments/{provider_id}/{date}")
async def get_booked_slots(provider_id: int, date: str):
    try:
        response = supabase_client.from_("appointment").select("appointment_time").eq("provider_number", provider_id).eq("appointment_date", date).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

@app.get("/appointments/booked_slots")
def get_booked_slots():
    try:
        response = supabase_client.table("appointment").select("provider_number, appointment_date, appointment_time").execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email

        with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

@app.post("/send-reminder/")
async def send_reminder(background_tasks: BackgroundTasks):
    print("Cron job triggered, processing reminder...")
    # Fetch appointments happening in the next 24 hours
    now = datetime.utcnow()
    tomorrow = now + timedelta(days=1)

    response = supabase_client.table("appointment").select("id, patient_email, appointment_time").gte("appointment_time", now.isoformat()).lt("appointment_time", tomorrow.isoformat()).execute()

    for appointment in response.data:
        email = appointment["patient_email"]
        slot_time = appointment["appointment_time"]
        message = f"Reminder: You have an appointment scheduled on {slot_time}."

        # Send email asynchronously
        background_tasks.add_task(send_email, email, "Appointment Reminder", message)

    return {"message": "Reminders are being sent in the background"}
    













"""
class PaymentRequest(BaseModel):
    amount: int  # Amount in cents (e.g., $10 = 1000)
    currency: str
    payment_method_id: str

@app.post("/create-payment-intent")
def create_payment_intent(request: PaymentRequest):
    try:
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            payment_method=request.payment_method_id,
            confirm=True,
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        """
"""
@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, "your_webhook_secret"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "payment_intent.succeeded":
        print("Payment successful!")

    return {"status": "success"}



"""