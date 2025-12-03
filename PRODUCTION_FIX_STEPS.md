# Production CORS Error - Fix Steps

## Problem Summary
The production frontend at https://homecostsaver.onrender.com is trying to connect to `http://localhost:8000` instead of the production backend at `https://hocs-backend.onrender.com`, causing CORS errors.

## Root Cause
The frontend was built without the `VITE_API_URL` environment variable set, so it defaulted to `http://localhost:8000`.

## Fix Steps

### Step 1: Set Environment Variable in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Find and click on your **frontend service** (the one serving https://homecostsaver.onrender.com)
3. Click on **"Environment"** in the left sidebar
4. Look for `VITE_API_URL` in the environment variables list

**If it exists:**
- Verify it's set to: `https://hocs-backend.onrender.com`
- If it's wrong, click "Edit" and update it

**If it doesn't exist:**
- Click **"Add Environment Variable"**
- Key: `VITE_API_URL`
- Value: `https://hocs-backend.onrender.com`
- Click "Save Changes"

### Step 2: Trigger a Manual Redeploy

**IMPORTANT**: Vite environment variables are embedded at **build time**, so you MUST rebuild the frontend after setting the variable.

1. In your frontend service on Render, click **"Manual Deploy"** in the top right
2. Select **"Clear build cache & deploy"**
3. Wait for the build to complete (usually 2-5 minutes)

### Step 3: Verify the Fix

1. Once the deploy completes, visit: https://homecostsaver.onrender.com
2. Open Firefox Developer Console (F12)
3. Go to the **Console** tab
4. Refresh the page (F5)
5. You should now see messages like:
   ```
   [API] Initialized with API_BASE_URL: https://hocs-backend.onrender.com
   [API] Environment: production
   ```

6. Test the application:
   - Enter a valid LA County address (e.g., "123 Main St, Los Angeles, CA")
   - Submit the form
   - You should NOT see the CORS error anymore

### Step 4: Check for Other Issues

If you still see errors after the rebuild:

1. **Check the Console logs** - Look for the `[API]` messages to confirm the correct URL
2. **Check Network tab** - See what URL the requests are actually going to
3. **Verify backend is running**: Visit https://hocs-backend.onrender.com/healthz
   - Should return: `{"status": "ok", "database": "connected", ...}`

## Alternative: Deploy via Git Push

If you prefer to deploy via Git (recommended for tracking changes):

1. **Update the deployment documentation** (already done in this repo)
2. **Commit and push** any pending changes:
   ```bash
   git add .
   git commit -m "Add diagnostic logging for production debugging"
   git push origin main
   ```
3. Render will auto-deploy both services
4. **Still need to set the environment variable** in Render dashboard (Step 1 above)
5. **Still need to trigger a rebuild** after setting the variable (Step 2 above)

## Why This Happened

Vite (the frontend build tool) embeds environment variables at **build time**, not runtime. This means:

- The `VITE_API_URL` value is baked into the JavaScript bundle during `npm run build`
- If the variable isn't set during build, it uses the default (`http://localhost:8000`)
- Changing the variable later requires a **rebuild** to take effect

## Verification Checklist

After completing the fix:

- [ ] Environment variable `VITE_API_URL=https://hocs-backend.onrender.com` is set in Render
- [ ] Frontend has been rebuilt (manual deploy with cache clear)
- [ ] Console shows `[API] Initialized with API_BASE_URL: https://hocs-backend.onrender.com`
- [ ] Address lookup works without CORS errors
- [ ] Backend health check works: https://hocs-backend.onrender.com/healthz

## Need Help?

If you're still seeing issues after following these steps:

1. Take a screenshot of the Firefox Console (F12 → Console tab)
2. Take a screenshot of the Network tab showing the failed request
3. Check the Render logs for both frontend and backend services
4. Share the screenshots and logs for further debugging