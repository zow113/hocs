from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="HOCS Backend API")

# MongoDB client
mongo_client = None
db = None

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite default dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    """Initialize MongoDB connection on startup"""
    global mongo_client, db
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    mongo_client = AsyncIOMotorClient(mongo_uri)
    db = mongo_client.get_database("hocs")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    if mongo_client:
        mongo_client.close()


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