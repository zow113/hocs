# Backend Deployment Issue - CRITICAL FIX NEEDED

## Problem Identified
The backend URL `https://hocs-backend.onrender.com` is serving **frontend HTML** instead of the FastAPI backend API. This is why you're getting CORS errors - the browser is trying to make API calls but receiving HTML responses.

## Evidence
```bash
curl https://hocs-backend.onrender.com/api/v1/properties/lookup
# Returns: <!doctype html>... (frontend HTML)
# Should return: FastAPI JSON response or 405 Method Not Allowed
```

## Root Cause
One of these scenarios is happening in your Render dashboard:

### Scenario 1: Wrong Service Type
The backend service was created as a "Static Site" instead of a "Web Service"

### Scenario 2: Wrong Root Directory
The backend service is pointing to the `frontend` directory instead of `backend`

### Scenario 3: Wrong Build/Start Commands
The backend service is running frontend build commands instead of backend commands

## Fix Steps

### Step 1: Check Your Render Services
Go to https://dashboard.render.com and verify you have **TWO separate services**:

1. **Frontend Service** (Static Site)
   - Name: Something like "hocs-frontend" or "homecostsaver"
   - Type: Static Site
   - URL: https://homecostsaver.onrender.com
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Backend Service** (Web Service)
   - Name: Something like "hocs-backend"
   - Type: **Web Service** (NOT Static Site)
   - URL: https://hocs-backend.onrender.com
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 2: Fix the Backend Service

If your backend service exists but is misconfigured:

1. Go to the backend service in Render dashboard
2. Click **"Settings"**
3. Verify/Update these settings:
   - **Root Directory**: `backend` (NOT `frontend` or blank)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Click **"Save Changes"**
5. Manually trigger a redeploy

### Step 3: If Backend Service Doesn't Exist

If you only have one service (the frontend), you need to create a new backend service:

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hocs-backend`
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (see below)
5. Click **"Create Web Service"**

### Step 4: Set Backend Environment Variables

In the backend service, add these environment variables:

```
MONGO_URI=mongodb+srv://andytzou_db_user:8Rq786fUJe07Txcu@cluster0.dhqq4v6.mongodb.net/hocs?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
SESSION_DURATION_HOURS=24
RESEND_API_KEY=re_aBUzmWL6_Dimc4jxCzc6uLBysdqNerjA8
FROM_EMAIL=onboarding@resend.dev
```

**Note**: Do NOT set `CORS_ORIGINS` as an environment variable - it's hardcoded in `main.py`

### Step 5: Verify Backend is Working

After the backend deploys, test it:

```bash
# Should return JSON with status, database, timestamp
curl https://hocs-backend.onrender.com/healthz

# Should return JSON with message and version
curl https://hocs-backend.onrender.com/

# Should return FastAPI docs HTML (not frontend HTML)
curl https://hocs-backend.onrender.com/docs
```

### Step 6: Update Frontend Environment Variable (if needed)

If you created a new backend service with a different URL:

1. Go to frontend service → Environment
2. Update `VITE_API_URL` to match your backend URL
3. Trigger a manual redeploy with cache clear

## Verification Checklist

After fixing:

- [ ] Backend service exists as a **Web Service** (not Static Site)
- [ ] Backend service root directory is `backend`
- [ ] Backend service start command is `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] `curl https://hocs-backend.onrender.com/healthz` returns JSON (not HTML)
- [ ] `curl https://hocs-backend.onrender.com/docs` returns FastAPI docs
- [ ] Frontend can successfully make API calls without CORS errors

## Common Mistakes to Avoid

1. **Don't use the same service for both frontend and backend** - They need separate services
2. **Don't set backend as Static Site** - It must be a Web Service
3. **Don't forget the root directory** - Backend must point to `backend` folder
4. **Don't use wrong start command** - Must be `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Current Service URLs

Based on your setup:
- Frontend: https://homecostsaver.onrender.com (correct - serving frontend)
- Backend: https://hocs-backend.onrender.com (WRONG - currently serving frontend HTML)

The backend URL needs to be reconfigured to serve the FastAPI application.