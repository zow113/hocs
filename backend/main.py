from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from typing import List
import re
import random
from uuid import uuid4
from io import BytesIO
from pydantic import BaseModel, EmailStr
from contextlib import asynccontextmanager

from models import (
    PropertyData,
    SavingsOpportunity,
    PropertyLookupRequest,
    PropertyLookupResponse,
    Session
)
from services.opportunity_service import generate_opportunities
from services.pdf_service import generate_report_pdf
from services.email_service import send_report_email

# Load environment variables
load_dotenv()

# MongoDB client
mongo_client = None
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    global mongo_client, db
    
    # Startup: Initialize MongoDB connection
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    mongo_client = AsyncIOMotorClient(mongo_uri)
    db = mongo_client.get_database("hocs")
    
    # Create TTL index on sessions collection
    await db.sessions.create_index("expires_at", expireAfterSeconds=0)
    print("✓ MongoDB connected and TTL index created on sessions.expires_at")
    
    yield
    
    # Shutdown: Close MongoDB connection
    if mongo_client:
        mongo_client.close()
        print("✓ MongoDB connection closed")


app = FastAPI(title="HOCS Backend API", version="1.0.0", lifespan=lifespan)

# CORS configuration
# Allow both development and production origins
origins = [
    "http://localhost:5173",  # Vite default dev server
    "http://localhost:5137",  # Vite dev server (alternate port)
    "http://localhost:5138",  # Vite dev server (alternate port)
    "http://localhost:5139",  # Vite dev server (alternate port)
    "http://localhost:3000",  # Common dev port
    "https://homecostsaver.onrender.com",  # Production frontend (primary)
    "https://hocs-frontend.onrender.com",  # Alternative production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/healthz")
async def health_check():
    """
    Health check endpoint that verifies database connectivity
    Returns status, database connection state, and timestamp
    """
    database_status = "disconnected"
    
    try:
        # Ping the database to verify connection
        if mongo_client:
            await mongo_client.admin.command('ping')
            database_status = "connected"
    except Exception as e:
        database_status = f"error: {str(e)}"
    
    return {
        "status": "ok",
        "database": database_status,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "HOCS Backend API", "version": "1.0.0"}


@app.get("/api/v1/addresses/autocomplete")
async def autocomplete_addresses(query: str = Query(..., min_length=1)):
    """
    Address autocomplete endpoint
    Returns LA County address suggestions based on query string
    """
    try:
        # Search addresses collection with case-insensitive regex
        addresses_collection = db.addresses
        
        # Use regex for case-insensitive partial matching
        regex_pattern = re.escape(query)
        cursor = addresses_collection.find(
            {"address": {"$regex": regex_pattern, "$options": "i"}},
            {"address": 1, "_id": 0}
        ).limit(10)
        
        results = await cursor.to_list(length=10)
        suggestions = [doc["address"] for doc in results]
        
        return {"suggestions": suggestions}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching addresses: {str(e)}")


def generate_mock_property_data(address: str) -> PropertyData:
    """
    Generate mock property data based on address
    Uses address hash to ensure consistent data for same address
    """
    # Use address hash for consistent random generation
    seed = hash(address) % (2**32)
    random.seed(seed)
    
    # Extract city from address if possible
    city_match = re.search(r',\s*([^,]+),\s*CA', address)
    city = city_match.group(1) if city_match else "Los Angeles"
    
    # Determine utility provider based on city
    # LA County specific utilities
    la_county_utilities = {
        "Pasadena": "Pasadena Water & Power",
        "Los Angeles": "LADWP",
        "Glendale": "Glendale Water & Power",
        "Burbank": "Burbank Water & Power",
        "Santa Monica": "Santa Monica Municipal Utilities"
    }
    
    # Check if it's an LA County city
    if city in la_county_utilities:
        utility_provider = la_county_utilities[city]
    else:
        # For non-LA County California addresses, use generic utility provider
        # This will be detected by the opportunity service to provide generic CA resources
        utility_provider = f"{city} Utilities"
    
    # Generate property data
    year_built = random.randint(1950, 2010)
    square_feet = random.randint(1200, 2500)
    bedrooms = random.randint(2, 4)
    bathrooms = random.randint(1, 3)
    lot_size = random.randint(4000, 8000)
    
    assessed_value = random.randint(500000, 900000)
    last_sale_price = int(assessed_value * random.uniform(1.05, 1.15))
    property_tax_estimate = int(assessed_value * 0.012)  # ~1.2% property tax rate
    
    wildfire_zone = random.choice(['Low', 'Medium', 'High'])
    roof_age = random.randint(5, 25)
    solar_feasibility_score = random.randint(65, 95)
    
    # Generate permit history
    permit_types = [
        'HVAC replacement', 'Kitchen remodel', 'Bathroom remodel',
        'Electrical upgrade', 'Roof replacement', 'Window replacement',
        'Solar installation', 'Water heater replacement'
    ]
    num_permits = random.randint(1, 3)
    permit_history = [
        f"{random.choice(permit_types)} ({random.randint(2010, 2023)})"
        for _ in range(num_permits)
    ]
    
    return PropertyData(
        address=address,
        yearBuilt=year_built,
        squareFeet=square_feet,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        lotSize=lot_size,
        lastSalePrice=last_sale_price,
        assessedValue=assessed_value,
        propertyTaxEstimate=property_tax_estimate,
        utilityProvider=utility_provider,
        wildfireZone=wildfire_zone,
        roofAge=roof_age,
        solarFeasibilityScore=solar_feasibility_score,
        permitHistory=permit_history
    )


@app.post("/api/v1/properties/lookup", response_model=PropertyLookupResponse)
async def lookup_property(request: PropertyLookupRequest):
    """
    Property lookup endpoint
    Returns property data, savings opportunities, and creates a session
    """
    try:
        address = request.address
        
        # Check if property exists in database
        properties_collection = db.properties
        existing_property = await properties_collection.find_one({"address": address})
        
        if existing_property:
            # Convert MongoDB document to PropertyData
            property_data = PropertyData(
                address=existing_property["address"],
                yearBuilt=existing_property["year_built"],
                squareFeet=existing_property["square_feet"],
                bedrooms=existing_property["bedrooms"],
                bathrooms=existing_property["bathrooms"],
                lotSize=existing_property["lot_size"],
                lastSalePrice=existing_property["last_sale_price"],
                assessedValue=existing_property["assessed_value"],
                propertyTaxEstimate=existing_property["property_tax_estimate"],
                utilityProvider=existing_property["utility_provider"],
                wildfireZone=existing_property["wildfire_zone"],
                roofAge=existing_property["roof_age"],
                solarFeasibilityScore=existing_property["solar_feasibility_score"],
                permitHistory=existing_property["permit_history"]
            )
        else:
            # Generate mock property data
            property_data = generate_mock_property_data(address)
            
            # Store in database
            property_doc = {
                "address": property_data.address,
                "year_built": property_data.yearBuilt,
                "square_feet": property_data.squareFeet,
                "bedrooms": property_data.bedrooms,
                "bathrooms": property_data.bathrooms,
                "lot_size": property_data.lotSize,
                "last_sale_price": property_data.lastSalePrice,
                "assessed_value": property_data.assessedValue,
                "property_tax_estimate": property_data.propertyTaxEstimate,
                "utility_provider": property_data.utilityProvider,
                "wildfire_zone": property_data.wildfireZone,
                "roof_age": property_data.roofAge,
                "solar_feasibility_score": property_data.solarFeasibilityScore,
                "permit_history": property_data.permitHistory,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await properties_collection.insert_one(property_doc)
        
        # Generate savings opportunities
        opportunities = generate_opportunities(property_data)
        
        # Create session
        session_id = str(uuid4())
        session_duration_hours = int(os.getenv("SESSION_DURATION_HOURS", "24"))
        expires_at = datetime.utcnow() + timedelta(hours=session_duration_hours)
        
        session_doc = {
            "session_id": session_id,
            "property_data": property_data.model_dump(by_alias=True),
            "opportunities": [opp.model_dump(by_alias=True) for opp in opportunities],
            "created_at": datetime.utcnow(),
            "expires_at": expires_at
        }
        
        sessions_collection = db.sessions
        await sessions_collection.insert_one(session_doc)
        
        return PropertyLookupResponse(
            property=property_data,
            opportunities=opportunities,
            session_id=session_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error looking up property: {str(e)}")


@app.get("/api/v1/sessions/{session_id}")
async def get_session(session_id: str):
    """
    Session retrieval endpoint
    Returns property data and opportunities if session is valid
    """
    try:
        sessions_collection = db.sessions
        session = await sessions_collection.find_one({"session_id": session_id})
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check if session expired
        if session["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=404, detail="Session expired")
        
        # Return session data
        return {
            "property": session["property_data"],
            "opportunities": session["opportunities"],
            "expires_at": session["expires_at"].isoformat() + "Z"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")


# Request models for report endpoints
class PDFReportRequest(BaseModel):
    """Request model for PDF report generation"""
    session_id: str


class EmailReportRequest(BaseModel):
    """Request model for email report"""
    session_id: str
    email: EmailStr
    opt_in_updates: bool = False


class WaitlistRequest(BaseModel):
    """Request model for waitlist signup"""
    email: EmailStr
    address: str


@app.post("/api/v1/reports/pdf")
async def generate_pdf_report(request: PDFReportRequest):
    """
    PDF report generation endpoint
    Returns a PDF file as a streaming response
    """
    try:
        # Fetch session data
        sessions_collection = db.sessions
        session_doc = await sessions_collection.find_one({"session_id": request.session_id})
        
        if not session_doc:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check if session expired
        if session_doc["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=404, detail="Session expired")
        
        # Convert session document to Session model
        session_data = Session(
            session_id=session_doc["session_id"],
            property_data=PropertyData(**session_doc["property_data"]),
            opportunities=[SavingsOpportunity(**opp) for opp in session_doc["opportunities"]],
            created_at=session_doc["created_at"],
            expires_at=session_doc["expires_at"]
        )
        
        # Generate PDF
        pdf_bytes = generate_report_pdf(session_data)
        
        # Return as streaming response
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=HOCS_Report.pdf"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@app.post("/api/v1/reports/email")
async def email_report(request: EmailReportRequest):
    """
    Email report endpoint
    Generates PDF and sends it via email
    """
    try:
        # Fetch session data
        sessions_collection = db.sessions
        session_doc = await sessions_collection.find_one({"session_id": request.session_id})
        
        if not session_doc:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check if session expired
        if session_doc["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=404, detail="Session expired")
        
        # Convert session document to Session model
        session_data = Session(
            session_id=session_doc["session_id"],
            property_data=PropertyData(**session_doc["property_data"]),
            opportunities=[SavingsOpportunity(**opp) for opp in session_doc["opportunities"]],
            created_at=session_doc["created_at"],
            expires_at=session_doc["expires_at"]
        )
        
        # Generate PDF
        pdf_bytes = generate_report_pdf(session_data)
        
        # Send email
        result = await send_report_email(
            to_email=request.email,
            pdf_bytes=pdf_bytes,
            session_id=request.session_id,
            opt_in=request.opt_in_updates,
            db_client=mongo_client
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")


@app.post("/api/v1/waitlist")
async def add_to_waitlist(request: WaitlistRequest):
    """
    Waitlist endpoint for unsupported areas
    Saves email and address for future notification
    """
    try:
        waitlist_collection = db.waitlist
        
        # Check if email already exists for this address
        existing = await waitlist_collection.find_one({
            "email": request.email,
            "address": request.address
        })
        
        if existing:
            return {
                "message": "You're already on the waitlist for this address",
                "already_registered": True
            }
        
        # Add to waitlist
        waitlist_doc = {
            "email": request.email,
            "address": request.address,
            "source": "unsupported_area",
            "created_at": datetime.utcnow(),
            "notified": False
        }
        
        await waitlist_collection.insert_one(waitlist_doc)
        
        return {
            "message": "Successfully added to waitlist",
            "already_registered": False
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to waitlist: {str(e)}")