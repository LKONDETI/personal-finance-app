# Banking API - Testing Guide

## 🚀 API is Running!

Your API is running at: **http://localhost:5000**

---

## 📍 Available Endpoints

### 1. Welcome (GET /)
```bash
curl http://localhost:5000
```
**Response:** Shows API info and available endpoints

### 2. Health Check (GET /health)
```bash
curl http://localhost:5000/health
```
**Response:** API health status

### 3. Register User (POST /api/auth/register)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### 4. Login (POST /api/auth/login)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 🧪 Testing with Browser

**What works in browser:**
- ✅ http://localhost:5000 - Shows welcome message
- ✅ http://localhost:5000/health - Shows health status

**What doesn't work in browser:**
- ❌ POST /api/auth/register - Browser can only do GET requests
- ❌ POST /api/auth/login - Need Postman or curl for POST

---

## 🛠️ Recommended Testing Tools

### Option 1: Postman (Best for APIs)
1. Download: https://www.postman.com/downloads/
2. Create a new request
3. Set method to POST
4. URL: `http://localhost:5000/api/auth/register`
5. Body → raw → JSON
6. Paste:
```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}
```
7. Click Send

### Option 2: Thunder Client (VS Code Extension)
1. Install "Thunder Client" extension in VS Code
2. Click Thunder Client icon
3. New Request → POST
4. Same steps as Postman

### Option 3: curl (Terminal)
Already shown above - easiest for quick tests!

---

## ✅ Quick Test

Run this in your terminal to test everything:

```bash
# 1. Check welcome
curl http://localhost:5000

# 2. Check health
curl http://localhost:5000/health

# 3. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"Demo123!","name":"Demo User"}'

# 4. Login with that user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"Demo123!"}'
```

You'll get a JWT token in the response! 🎉

---

## 💡 Why Browser Shows Empty Page?

Your API is **working perfectly**! Here's why the browser shows nothing:

1. **APIs return JSON, not HTML** - Browsers expect HTML web pages
2. **No root endpoint was defined** - We only created `/health` and `/api/auth/*`
3. **POST requests need special tools** - Browsers only do GET requests by default

**Solution:** Use Postman, Thunder Client, or curl to test API endpoints!
