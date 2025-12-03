# Deployment Fixes for NetworkError Issue

## Problem
When entering an address outside Los Angeles County in the deployed version, users get: **"NetworkError when attempting to fetch resource"**

**Debug Error**:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://hocs-backend.onrender.com/api/v1/waitlist. (Reason: CORS header 'Access-Control-Allow-Origin' missing). Status code: 200.
```

## Root Causes

### 1. CORS Configuration Issue ✅ FIXED
**Location**: [`backend/main.py`](backend/main.py:59-75)

**Problem**: The deployed backend at `https://hocs-backend.onrender.com` was not sending CORS headers allowing the production frontend.

**Fix Applied**: Updated CORS configuration to include production frontend URLs and expose headers:
```python
origins = [
    "http://localhost:5173",  # Vite default dev server
    "http://localhost:5137",  # Vite dev server (alternate port)
    "http://localhost:3000",  # Common dev port
    "https://homecostsaver.onrender.com",  # Production frontend ✅ ADDED
    "https://hocs-frontend.onrender.com",  # Alternative production frontend URL ✅ ADDED
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # ✅ ADDED
)
```

### 2. API URL Configuration Issue
**Location**: Frontend environment variables

**Problem**: The frontend's `VITE_API_URL` was set to `http://localhost:8000`, which doesn't work in production.

**Fix Required**: Set the `VITE_API_URL` environment variable in Render to:
```
VITE_API_URL=https://hocs-backend.onrender.com
```

## Deployment Steps

### Step 1: Deploy Backend Changes ⚠️ REQUIRED
The backend code has been updated locally but needs to be deployed to Render:

1. **Commit the changes**:
   ```bash
   git add backend/main.py DEPLOYMENT_FIXES.md
   git commit -m "Fix CORS configuration for production frontend"
   git push origin main
   ```

2. **Verify Render auto-deploys**:
   - Go to Render dashboard → Backend service
   - Check that a new deploy is triggered automatically
   - Wait for deploy to complete (usually 2-3 minutes)

3. **Verify backend is running**:
   - Visit: https://hocs-backend.onrender.com/healthz
   - Should return: `{"status": "ok", "database": "connected", ...}`

### Step 2: Update Frontend Environment Variables
1. Go to Render dashboard → Your frontend service
2. Navigate to "Environment" section
3. Add/Update environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://hocs-backend.onrender.com`
4. Click "Save Changes"
5. Manually trigger a redeploy (important: environment variables require rebuild)

### Step 3: Verify the Fix
1. Visit: https://homecostsaver.onrender.com
2. Enter an address outside LA County (e.g., "123 Main St, San Francisco, CA")
3. Waitlist dialog should appear
4. Enter email and submit
5. Should see success message (no NetworkError)

## Diagnostic Logging Added

Added console logging to help debug future issues:

**In [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts)**:
- Logs API requests with URL and options
- Logs response status
- Identifies network/CORS errors vs other errors

**In [`frontend/src/pages/Home.tsx`](frontend/src/pages/Home.tsx)**:
- Logs waitlist submission attempts
- Logs response data
- Identifies error types

To view logs:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for messages prefixed with `[API]` and `[Waitlist]`

## Files Modified

1. ✅ `backend/main.py` - Updated CORS configuration with production origins and expose_headers
2. ✅ `frontend/.env.example` - Documented production URL
3. ✅ `frontend/src/lib/api.ts` - Added diagnostic logging
4. ✅ `frontend/src/pages/Home.tsx` - Added diagnostic logging
5. ✅ `DEPLOYMENT.md` - Created comprehensive deployment guide
6. ✅ `DEPLOYMENT_FIXES.md` - This file (updated with deployment instructions)

## Important Notes

- ⚠️ **Backend changes must be committed and pushed** to trigger Render deployment
- **Frontend environment variable** must be set manually in Render dashboard (if not already set)
- **Frontend must be rebuilt** after setting environment variable (Render should do this automatically)
- The diagnostic logging can be removed later if desired, but it's helpful for debugging
- The CORS fix includes `expose_headers=["*"]` to ensure all response headers are accessible

## Quick Deploy Checklist

- [ ] Commit and push backend changes to Git
- [ ] Verify Render backend auto-deploys
- [ ] Check backend health: https://hocs-backend.onrender.com/healthz
- [ ] Verify frontend environment variable `VITE_API_URL=https://hocs-backend.onrender.com` is set in Render
- [ ] Test waitlist submission on production site

## Testing Checklist

After deployment:

- [ ] Backend health check works: https://hocs-backend.onrender.com/healthz
- [ ] Frontend loads: https://homecostsaver.onrender.com
- [ ] LA County address lookup works (e.g., "123 Main St, Los Angeles, CA")
- [ ] Non-LA County address shows waitlist dialog (e.g., "123 Main St, San Francisco, CA")
- [ ] Waitlist submission succeeds without NetworkError
- [ ] Check browser console for `[API]` logs showing correct URL
- [ ] Verify waitlist entry in MongoDB

## Rollback Plan

If issues persist:

1. Check Render logs for both services
2. Verify environment variables are set correctly
3. Check browser console for detailed error messages
4. Verify MongoDB connection is working
5. Test backend directly: https://hocs-backend.onrender.com/docs

## Future Improvements

Consider these enhancements:

1. **Environment-based CORS**: Read allowed origins from environment variable
2. **Better error messages**: Show user-friendly messages for network errors
3. **Retry logic**: Automatically retry failed requests
4. **Health monitoring**: Add uptime monitoring for both services
5. **Remove diagnostic logs**: Once stable, remove verbose console logging