# Deployment Guide

## Overview
This guide covers deploying the HOCS application with:
- **Frontend**: Render (https://homecostsaver.onrender.com/)
- **Backend**: Render (https://hocs-backend.onrender.com)

## Backend Deployment (Render)

### Environment Variables
Set these in your Render backend service dashboard:

```
MONGO_URI=mongodb+srv://andytzou_db_user:xJ6rzSmIqj8aYfHM@cluster0.dhqq4v6.mongodb.net/hocs?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
CORS_ORIGINS=https://homecostsaver.onrender.com
SESSION_DURATION_HOURS=24
RESEND_API_KEY=re_aBUzmWL6_Dimc4jxCzc6uLBysdqNerjA8
FROM_EMAIL=onboarding@resend.dev
```

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Important Notes
- The backend CORS configuration in `main.py` must include your frontend URL
- Currently configured for: `https://homecostsaver.onrender.com`
- If you change the frontend URL, update the CORS origins in `backend/main.py`

## Frontend Deployment (Render)

### Environment Variables
Set these in your Render frontend service dashboard:

```
VITE_API_URL=https://hocs-backend.onrender.com
VITE_GOOGLE_PLACES_API_KEY=AIzaSyBewikSRuvQeIq2_xXYCChta3H0-Y30Ofc
```

### Build Command
```bash
npm install && npm run build
```

### Publish Directory
```
dist
```

### Important Notes
- The `VITE_API_URL` must point to your deployed backend
- Environment variables with `VITE_` prefix are embedded at build time
- If you change the backend URL, you must rebuild the frontend

## Troubleshooting

### NetworkError when attempting to fetch resource

This error typically occurs due to one of these issues:

1. **CORS Configuration Mismatch**
   - **Symptom**: Browser console shows CORS policy error
   - **Fix**: Ensure `backend/main.py` includes your frontend URL in the `origins` list
   - **Current Config**: `https://homecostsaver.onrender.com`

2. **Wrong API URL**
   - **Symptom**: Browser console shows "Failed to fetch" or connection refused
   - **Fix**: Set `VITE_API_URL` environment variable in Render to your backend URL
   - **Current Config**: `https://hocs-backend.onrender.com`

3. **Backend Not Running**
   - **Symptom**: 502 Bad Gateway or connection timeout
   - **Fix**: Check Render backend logs to ensure the service is running

### Checking Logs

**Backend Logs (Render)**:
1. Go to your backend service in Render dashboard
2. Click "Logs" tab
3. Look for startup messages and any errors

**Frontend Logs (Browser)**:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for `[API]` and `[Waitlist]` prefixed messages (diagnostic logging)

### Testing the Fix

After deploying both services:

1. Visit your frontend URL: https://homecostsaver.onrender.com
2. Enter an address outside Los Angeles County (e.g., "123 Main St, San Francisco, CA")
3. The waitlist dialog should appear
4. Enter an email and submit
5. Check browser console for any errors
6. Verify the waitlist entry in MongoDB

## Local Development

### Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

### Local Environment Variables

**Backend** (`backend/.env`):
```
MONGO_URI=mongodb+srv://...
PORT=8000
CORS_ORIGINS=http://localhost:5173
SESSION_DURATION_HOURS=24
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_PLACES_API_KEY=AIzaSyBewikSRuvQeIq2_xXYCChta3H0-Y30Ofc
```

## Deployment Checklist

Before deploying:

- [ ] Backend CORS includes frontend URL
- [ ] Frontend `VITE_API_URL` points to backend
- [ ] All environment variables are set in Render
- [ ] MongoDB connection string is correct
- [ ] Google Places API key is valid
- [ ] Resend API key is valid

After deploying:

- [ ] Backend health check works: `https://hocs-backend.onrender.com/healthz`
- [ ] Frontend loads without errors
- [ ] Address autocomplete works
- [ ] Property lookup works for LA County addresses
- [ ] Waitlist dialog appears for non-LA County addresses
- [ ] Waitlist submission works
- [ ] PDF generation works
- [ ] Email sending works

## URLs

- **Frontend**: https://homecostsaver.onrender.com/
- **Backend**: https://hocs-backend.onrender.com
- **Backend Health**: https://hocs-backend.onrender.com/healthz
- **Backend API Docs**: https://hocs-backend.onrender.com/docs