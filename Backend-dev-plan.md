# Backend Development Plan - HOCS (Home Ownership Cost Saver)

## 1️⃣ Executive Summary

**What Will Be Built:**
- FastAPI backend serving property analysis and savings opportunities for LA County homeowners
- MongoDB Atlas database storing property lookups, opportunities, and email subscriptions
- RESTful API endpoints supporting address search, property insights, savings diagnostics, and report generation
- Email delivery system for action plans and optional update notifications

**Why:**
- Frontend currently uses mock data and needs real backend to persist sessions and deliver personalized recommendations
- Users need ability to save analysis results, download PDF reports, and receive email notifications
- System must support address autocomplete, property data retrieval simulation, and opportunity generation

**Constraints:**
- FastAPI with Python 3.13 (async)
- MongoDB Atlas only (no local instance)
- Motor driver with Pydantic v2 models
- No Docker deployment
- Manual testing after every task via frontend UI
- Single branch `main` Git workflow
- API base path: `/api/v1/*`

**Dynamic Sprint Structure:**
- S0: Environment setup and frontend connection
- S1: Address search and property data management
- S2: Savings opportunities and diagnostics
- S3: Email delivery and PDF report generation
- Total: 4 sprints covering all frontend-visible features

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
- Address autocomplete for LA County addresses
- Property data storage and retrieval
- Savings opportunity generation based on property attributes
- Session management (24-hour expiration)
- PDF report generation with property insights and action plan
- Email delivery for reports
- Email opt-in for future updates
- Health check endpoint with MongoDB connectivity test

**Success Criteria:**
- All frontend features functional end-to-end with real backend
- Address search returns autocomplete suggestions within 500ms
- Property analysis completes within 3 seconds
- PDF reports generate within 5 seconds
- Email delivery completes within 1 minute
- All task-level manual tests pass via frontend UI
- Each sprint's code pushed to `main` after verification

---

## 3️⃣ API Design

**Base Path:** `/api/v1`

**Error Envelope:** `{ "error": "message" }`

### Endpoints

**Health Check**
- `GET /healthz`
- Purpose: Verify backend is running and MongoDB Atlas is connected
- Response: `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`
- Validation: Performs MongoDB ping operation

**Address Autocomplete**
- `GET /api/v1/addresses/autocomplete?query={text}`
- Purpose: Return LA County address suggestions as user types
- Request: Query parameter `query` (min 3 characters)
- Response: `{ "suggestions": ["address1", "address2", ...] }`
- Validation: Filter to LA County only, return max 10 results

**Property Lookup**
- `POST /api/v1/properties/lookup`
- Purpose: Retrieve or generate property data for given address
- Request: `{ "address": "string" }`
- Response: `{ "property": PropertyData, "opportunities": [SavingsOpportunity], "session_id": "uuid" }`
- Validation: Address must be in LA County, create session with 24-hour TTL

**Get Session**
- `GET /api/v1/sessions/{session_id}`
- Purpose: Retrieve existing session data
- Response: `{ "property": PropertyData, "opportunities": [SavingsOpportunity], "expires_at": "ISO8601" }`
- Validation: Return 404 if session expired or not found

**Generate PDF Report**
- `POST /api/v1/reports/pdf`
- Purpose: Generate downloadable PDF report
- Request: `{ "session_id": "uuid" }`
- Response: PDF file download
- Validation: Session must exist and not be expired

**Email Report**
- `POST /api/v1/reports/email`
- Purpose: Send PDF report via email
- Request: `{ "session_id": "uuid", "email": "string", "opt_in_updates": boolean }`
- Response: `{ "message": "Report sent successfully" }`
- Validation: Valid email format, session exists, store opt-in preference

---

## 4️⃣ Data Model (MongoDB Atlas)

### Collection: `addresses`
- `_id`: ObjectId (auto-generated)
- `address`: string (indexed, unique)
- `city`: string
- `state`: string (default "CA")
- `zip_code`: string
- `county`: string (default "Los Angeles")
- `created_at`: datetime

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "address": "123 Main St, Pasadena, CA 91101",
  "city": "Pasadena",
  "state": "CA",
  "zip_code": "91101",
  "county": "Los Angeles",
  "created_at": "2025-12-02T09:00:00Z"
}
```

### Collection: `properties`
- `_id`: ObjectId (auto-generated)
- `address`: string (indexed)
- `year_built`: int
- `square_feet`: int
- `bedrooms`: int
- `bathrooms`: float
- `lot_size`: int
- `last_sale_price`: int
- `assessed_value`: int
- `property_tax_estimate`: int
- `utility_provider`: string
- `wildfire_zone`: string (enum: "Low", "Medium", "High")
- `roof_age`: int
- `solar_feasibility_score`: int (0-100)
- `permit_history`: array of strings
- `created_at`: datetime
- `updated_at`: datetime

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "address": "123 Main St, Pasadena, CA 91101",
  "year_built": 1965,
  "square_feet": 1850,
  "bedrooms": 3,
  "bathrooms": 2.0,
  "lot_size": 6500,
  "last_sale_price": 725000,
  "assessed_value": 680000,
  "property_tax_estimate": 8160,
  "utility_provider": "Pasadena Water & Power",
  "wildfire_zone": "Medium",
  "roof_age": 18,
  "solar_feasibility_score": 85,
  "permit_history": ["HVAC replacement (2015)", "Kitchen remodel (2018)"],
  "created_at": "2025-12-02T09:00:00Z",
  "updated_at": "2025-12-02T09:00:00Z"
}
```

### Collection: `sessions`
- `_id`: ObjectId (auto-generated)
- `session_id`: string (UUID, indexed, unique)
- `property_id`: ObjectId (reference to properties)
- `opportunities`: array of embedded SavingsOpportunity objects
- `created_at`: datetime
- `expires_at`: datetime (24 hours from creation)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "property_id": "507f1f77bcf86cd799439012",
  "opportunities": [...],
  "created_at": "2025-12-02T09:00:00Z",
  "expires_at": "2025-12-03T09:00:00Z"
}
```

### Collection: `email_subscriptions`
- `_id`: ObjectId (auto-generated)
- `email`: string (indexed, unique)
- `session_id`: string (UUID)
- `opt_in_updates`: boolean
- `subscribed_at`: datetime
- `last_report_sent`: datetime

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "email": "user@example.com",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "opt_in_updates": true,
  "subscribed_at": "2025-12-02T09:00:00Z",
  "last_report_sent": "2025-12-02T09:05:00Z"
}
```

---

## 5️⃣ Frontend Audit & Feature Map

### Home Page (`/`)
- **Route:** Home.tsx
- **Purpose:** Address search and property lookup initiation
- **Data Needed:** LA County addresses for autocomplete
- **Backend Endpoints:**
  - `GET /api/v1/addresses/autocomplete?query={text}`
  - `POST /api/v1/properties/lookup`
- **Models:** Address, Property, Session
- **Auth:** None
- **Notes:** Frontend validates LA County before submission; backend creates session on successful lookup

### Diagnostic Page (`/diagnostic`)
- **Route:** Diagnostic.tsx
- **Purpose:** Display property insights and all savings opportunities
- **Data Needed:** Property data, savings opportunities list
- **Backend Endpoints:**
  - `GET /api/v1/sessions/{session_id}` (to restore session)
- **Models:** Property, SavingsOpportunity, Session
- **Auth:** None
- **Notes:** Data loaded from PropertyContext (session storage); backend provides session restoration if page refreshed

### Plan Page (`/plan`)
- **Route:** Plan.tsx
- **Purpose:** Display tiered action plan, download PDF, email report
- **Data Needed:** Property data, opportunities organized by tier
- **Backend Endpoints:**
  - `POST /api/v1/reports/pdf`
  - `POST /api/v1/reports/email`
- **Models:** Property, SavingsOpportunity, EmailSubscription
- **Auth:** None
- **Notes:** PDF generation and email delivery are primary backend operations on this page

---

## 6️⃣ Configuration & ENV Vars

**Core Environment Variables:**
- `APP_ENV` - Environment (development, production)
- `PORT` - HTTP port (default: 8000)
- `MONGODB_URI` - MongoDB Atlas connection string (required)
- `CORS_ORIGINS` - Allowed frontend URLs (comma-separated, default: http://localhost:5173)
- `SESSION_DURATION_HOURS` - Session expiration (default: 24)
- `SMTP_HOST` - Email server host (e.g., smtp.gmail.com)
- `SMTP_PORT` - Email server port (default: 587)
- `SMTP_USER` - Email account username
- `SMTP_PASSWORD` - Email account password
- `FROM_EMAIL` - Sender email address

---

## 7️⃣ Background Work

**Not Required:**
- No background tasks needed for MVP
- All operations (PDF generation, email sending) complete synchronously within request timeout
- Session cleanup handled by MongoDB TTL index on `expires_at` field

---

## 8️⃣ Integrations

**Email Delivery (SMTP):**
- Trigger: User clicks "Email Plan" and submits email address
- Purpose: Send PDF report as attachment
- Flow: Generate PDF → Attach to email → Send via SMTP → Store subscription if opt-in checked
- Extra ENV vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL

**PDF Generation (ReportLab or WeasyPrint):**
- Trigger: User clicks "Download Action Plan" or "Email Plan"
- Purpose: Generate professional PDF report with property insights and tiered action plan
- Flow: Fetch session data → Render HTML template → Convert to PDF → Return as download or email attachment
- No extra ENV vars needed

---

## 9️⃣ Testing Strategy (Manual via Frontend)

**Validation Approach:**
- All testing performed through frontend UI
- Every task includes Manual Test Step and User Test Prompt
- After completing all tasks in a sprint, commit and push to `main`
- If any test fails, fix and retest before pushing

**Test Pattern for Each Task:**
- **Manual Test Step:** Specific UI action + expected result
- **User Test Prompt:** Copy-paste friendly instruction for testing

---

## 🔟 Dynamic Sprint Plan & Backlog

---

## S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI skeleton with `/api/v1` base path and `/healthz` endpoint
- Connect to MongoDB Atlas using `MONGODB_URI`
- `/healthz` performs DB ping and returns JSON status
- Enable CORS for frontend origin
- Replace dummy API URLs in frontend with real backend URLs
- Initialize Git at root, set default branch to `main`, push to GitHub
- Create single `.gitignore` at root (ignore `__pycache__`, `.env`, `*.pyc`, `venv/`, `.vscode/`)

**User Stories:**
- As a developer, I need a working FastAPI backend that connects to MongoDB Atlas
- As a developer, I need CORS enabled so frontend can make API calls
- As a developer, I need health check endpoint to verify backend and database connectivity

**Tasks:**

1. **Create FastAPI project structure**
   - Create `backend/` directory at project root
   - Create `backend/main.py` with FastAPI app instance
   - Create `backend/requirements.txt` with dependencies: fastapi, uvicorn, motor, pydantic, python-dotenv, pymongo
   - Create `backend/.env.example` with all required environment variables
   - Manual Test Step: Run `pip install -r requirements.txt` → all packages install successfully
   - User Test Prompt: "Install backend dependencies and confirm no errors"

2. **Implement health check endpoint**
   - Create `GET /healthz` endpoint in `main.py`
   - Perform MongoDB ping operation
   - Return JSON: `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`
   - Handle connection errors gracefully
   - Manual Test Step: Start backend → visit `http://localhost:8000/healthz` → see 200 OK with database status
   - User Test Prompt: "Start the backend with `uvicorn main:app --reload` and visit /healthz to confirm database connection"

3. **Configure CORS for frontend**
   - Add CORS middleware to FastAPI app
   - Read `CORS_ORIGINS` from environment (default: http://localhost:5173)
   - Allow credentials, all methods, all headers
   - Manual Test Step: Start frontend → open browser console → no CORS errors when making requests
   - User Test Prompt: "Start both frontend and backend, open browser console, and confirm no CORS errors"

4. **Initialize Git repository**
   - Run `git init` at project root (if not already initialized)
   - Create `.gitignore` at root with: `__pycache__/`, `.env`, `*.pyc`, `venv/`, `.vscode/`, `node_modules/`
   - Set default branch to `main`: `git branch -M main`
   - Create initial commit with all files
   - Manual Test Step: Run `git status` → see clean working tree with ignored files not tracked
   - User Test Prompt: "Run `git status` and confirm .env and __pycache__ are not tracked"

5. **Push to GitHub**
   - Create new GitHub repository
   - Add remote: `git remote add origin <repo-url>`
   - Push to main: `git push -u origin main`
   - Manual Test Step: Visit GitHub repository → see all files pushed successfully
   - User Test Prompt: "Visit your GitHub repository and confirm all files are present on main branch"

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` returns 200 OK with MongoDB connection status
- Frontend can make API calls without CORS errors
- Git repository initialized with `.gitignore`
- Code pushed to GitHub on `main` branch

**Post-Sprint:**
- Commit all changes with message: "S0: Environment setup complete"
- Push to `main` branch

---

## S1 – Address Search & Property Data Management

**Objectives:**
- Implement address autocomplete endpoint
- Seed MongoDB with LA County addresses
- Implement property lookup endpoint
- Create session management with 24-hour expiration
- Generate savings opportunities based on property attributes

**User Stories:**
- As a user, I can search for my LA County address with autocomplete suggestions
- As a user, I can submit my address and receive property insights within 3 seconds
- As a user, my analysis session persists for 24 hours

**Tasks:**

1. **Create Pydantic models**
   - Create `backend/models.py`
   - Define `Address`, `Property`, `SavingsOpportunity`, `Session` models using Pydantic v2
   - Match TypeScript interfaces from frontend exactly
   - Manual Test Step: Import models in Python REPL → create instances → no validation errors
   - User Test Prompt: "Run `python -c 'from models import Property; print(Property)'` and confirm no import errors"

2. **Seed LA County addresses**
   - Create `backend/seed_data.py` script
   - Insert 5 LA County addresses from frontend mock data into `addresses` collection
   - Run script to populate database
   - Manual Test Step: Query MongoDB Atlas → see 5 addresses in `addresses` collection
   - User Test Prompt: "Check MongoDB Atlas and confirm 5 addresses are present in the addresses collection"

3. **Implement address autocomplete endpoint**
   - Create `GET /api/v1/addresses/autocomplete?query={text}`
   - Query `addresses` collection with case-insensitive regex match
   - Return max 10 suggestions
   - Filter to LA County only
   - Manual Test Step: Start backend → type "123" in frontend search → see autocomplete suggestions appear
   - User Test Prompt: "Type '123' in the address search box and confirm autocomplete suggestions appear within 500ms"

4. **Implement property lookup endpoint**
   - Create `POST /api/v1/properties/lookup`
   - Accept `{ "address": "string" }` in request body
   - Check if property exists in `properties` collection
   - If not exists, generate mock property data based on address
   - Generate savings opportunities using algorithm from frontend `generateMockOpportunities()`
   - Create session with UUID, store in `sessions` collection with 24-hour TTL
   - Return property data, opportunities, and session_id
   - Manual Test Step: Submit address in frontend → navigate to diagnostic page → see property data and opportunities
   - User Test Prompt: "Enter '123 Main St, Pasadena' and click 'Find Programs'. Confirm you see property details and savings opportunities on the diagnostic page"

5. **Implement session retrieval endpoint**
   - Create `GET /api/v1/sessions/{session_id}`
   - Query `sessions` collection by session_id
   - Check if session expired (compare `expires_at` with current time)
   - Return 404 if expired or not found
   - Return property data and opportunities if valid
   - Manual Test Step: Refresh diagnostic page → session data persists → no redirect to home
   - User Test Prompt: "After viewing diagnostic page, refresh the browser and confirm data persists without redirecting to home"

6. **Create MongoDB TTL index**
   - Add TTL index on `sessions.expires_at` field (expires after 0 seconds past expires_at)
   - Verify index created in MongoDB Atlas
   - Manual Test Step: Check MongoDB Atlas → see TTL index on sessions collection
   - User Test Prompt: "Check MongoDB Atlas indexes for sessions collection and confirm TTL index exists on expires_at field"

**Definition of Done:**
- Address autocomplete returns suggestions within 500ms
- Property lookup creates session and returns data within 3 seconds
- Session persists for 24 hours and auto-expires via TTL index
- Frontend can search, view diagnostics, and restore session on refresh

**Post-Sprint:**
- Commit all changes with message: "S1: Address search and property management complete"
- Push to `main` branch

---

## S2 – Savings Opportunities & Diagnostics

**Objectives:**
- Implement opportunity generation algorithm matching frontend logic
- Store opportunities in session
- Support filtering and sorting via API (if needed by frontend)
- Ensure all opportunity fields match frontend TypeScript interfaces

**User Stories:**
- As a user, I see personalized savings opportunities based on my property attributes
- As a user, I can filter opportunities by category
- As a user, I see accurate savings calculations and rebate information

**Tasks:**

1. **Implement opportunity generation algorithm**
   - Create `backend/services/opportunity_service.py`
   - Port `generateMockOpportunities()` logic from frontend to Python
   - Generate opportunities based on property attributes (year_built, solar_feasibility_score, etc.)
   - Include all fields: id, category, name, annual_savings, upfront_cost, rebates, payback_months, difficulty, confidence_score, benefits, next_steps, methodology, official_resources
   - Manual Test Step: Submit address → view diagnostic page → see same opportunities as frontend mock data
   - User Test Prompt: "Enter '123 Main St, Pasadena' and verify the diagnostic page shows opportunities like 'Free Home Energy Audit' and 'Solar Installation'"

2. **Store opportunities in session**
   - Update property lookup endpoint to call opportunity service
   - Store generated opportunities array in `sessions` collection
   - Ensure opportunities persist with session
   - Manual Test Step: Refresh diagnostic page → opportunities still visible
   - User Test Prompt: "After viewing opportunities, refresh the page and confirm all opportunities are still displayed"

3. **Verify opportunity data structure**
   - Compare backend response with frontend TypeScript interfaces
   - Ensure all fields match exactly (camelCase in JSON response)
   - Test with multiple property types (old homes, high solar feasibility, etc.)
   - Manual Test Step: Open browser DevTools → Network tab → inspect API response → verify JSON structure matches frontend types
   - User Test Prompt: "Open browser DevTools, go to Network tab, submit an address, and verify the API response structure matches the frontend expectations"

4. **Test category filtering**
   - Frontend filters opportunities by category locally
   - Verify all categories present in opportunities: energy, solar, water, maintenance
   - Manual Test Step: On diagnostic page → select "Energy Efficiency" filter → see only energy opportunities
   - User Test Prompt: "On the diagnostic page, use the category filter dropdown and confirm filtering works correctly for each category"

5. **Test opportunity details modal**
   - Click "Details" button on any opportunity
   - Verify modal shows all fields: benefits, next steps, rebates, official resources, methodology
   - Manual Test Step: Click info icon on any opportunity → modal opens with complete details
   - User Test Prompt: "Click the info icon on any opportunity and confirm the modal displays all details including rebates and official resources"

**Definition of Done:**
- Opportunities generated match frontend mock data structure
- All opportunity fields present and correctly formatted
- Category filtering works in frontend
- Opportunity details display correctly in modal

**Post-Sprint:**
- Commit all changes with message: "S2: Savings opportunities and diagnostics complete"
- Push to `main` branch

---

## S3 – Email Delivery & PDF Report Generation

**Objectives:**
- Implement PDF report generation with property insights and tiered action plan
- Implement email delivery with PDF attachment
- Store email subscriptions with opt-in preferences
- Handle email validation and error cases

**User Stories:**
- As a user, I can download a PDF report of my action plan
- As a user, I can email the report to myself
- As a user, I can opt-in to receive future updates via email

**Tasks:**

1. **Install PDF generation library**
   - Add `reportlab` or `weasyprint` to `requirements.txt`
   - Install dependencies
   - Create `backend/services/pdf_service.py`
   - Manual Test Step: Run `pip install -r requirements.txt` → PDF library installs successfully
   - User Test Prompt: "Install updated dependencies and confirm no errors"

2. **Implement PDF report generation**
   - Create PDF template with sections: cover page, property insights, opportunities by tier, action plan
   - Fetch session data (property + opportunities)
   - Organize opportunities into 5 tiers matching frontend Plan.tsx logic
   - Generate PDF with professional formatting
   - Return PDF as downloadable file
   - Manual Test Step: Click "Download Action Plan" → PDF downloads within 5 seconds
   - User Test Prompt: "Click 'Download Action Plan' button and confirm PDF downloads successfully with all sections present"

3. **Create PDF generation endpoint**
   - Create `POST /api/v1/reports/pdf`
   - Accept `{ "session_id": "uuid" }` in request body
   - Validate session exists and not expired
   - Call PDF service to generate report
   - Return PDF file with appropriate headers (`Content-Type: application/pdf`, `Content-Disposition: attachment`)
   - Manual Test Step: Click download button → PDF opens in browser or downloads to device
   - User Test Prompt: "Download the PDF report and verify it opens correctly with all property details and opportunities"

4. **Install email library**
   - Add `aiosmtplib` and `email` to `requirements.txt`
   - Install dependencies
   - Create `backend/services/email_service.py`
   - Manual Test Step: Run `pip install -r requirements.txt` → email library installs successfully
   - User Test Prompt: "Install updated dependencies and confirm no errors"

5. **Implement email delivery service**
   - Create async function to send email with PDF attachment
   - Use SMTP credentials from environment variables
   - Generate PDF, attach to email
   - Send email with subject: "Your HOCS Action Plan"
   - Handle SMTP errors gracefully
   - Manual Test Step: Click "Email Plan" → enter email → receive email within 1 minute
   - User Test Prompt: "Click 'Email Plan', enter your email address, and confirm you receive the email with PDF attachment within 1 minute"

6. **Create email report endpoint**
   - Create `POST /api/v1/reports/email`
   - Accept `{ "session_id": "uuid", "email": "string", "opt_in_updates": boolean }`
   - Validate email format
   - Validate session exists
   - Generate PDF
   - Send email via email service
   - Store email subscription in `email_subscriptions` collection if opt_in_updates is true
   - Return success message
   - Manual Test Step: Submit email form → see success toast → check inbox for email
   - User Test Prompt: "Enter your email, check 'opt-in for updates', submit, and verify you receive the email and see success message"

7. **Test email opt-in storage**
   - Submit email with opt_in_updates = true
   - Query MongoDB Atlas `email_subscriptions` collection
   - Verify email stored with correct opt_in_updates value
   - Manual Test Step: Check MongoDB Atlas → see email subscription record
   - User Test Prompt: "After opting in for updates, check MongoDB Atlas email_subscriptions collection and confirm your email is stored"

8. **Test email validation**
   - Submit invalid email (no @ symbol)
   - Verify frontend shows error message
   - Verify backend returns 400 error for invalid email
   - Manual Test Step: Enter "invalidemail" → see error message
   - User Test Prompt: "Try submitting an invalid email address and confirm you see an error message"

**Definition of Done:**
- PDF reports generate within 5 seconds with all sections
- Email delivery completes within 1 minute
- Email subscriptions stored correctly with opt-in preferences
- Email validation prevents invalid submissions
- All frontend email/PDF features functional

**Post-Sprint:**
- Commit all changes with message: "S3: Email delivery and PDF generation complete"
- Push to `main` branch

---

## ✅ STYLE & COMPLIANCE CHECKS

**Verification Checklist:**
- ✅ Bullets only (no tables or paragraphs)
- ✅ Only features visible in frontend included
- ✅ Minimal APIs/models aligned with UI
- ✅ MongoDB Atlas only (no local instance)
- ✅ Python 3.13 runtime specified
- ✅ Each task has Manual Test Step + User Test Prompt
- ✅ After all sprint tests pass → commit & push to `main`
- ✅ API base path: `/api/v1/*`
- ✅ No Docker mentioned
- ✅ FastAPI with async/await
- ✅ Motor + Pydantic v2 for MongoDB
- ✅ Single branch `main` Git workflow
- ✅ Manual testing after every task (not just sprints)

---

## 🎯 NEXT STEPS

After saving this Backend-dev-plan.md file, switch to **orchestrator mode** to execute the development plan sprint by sprint.