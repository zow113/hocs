"""
Script to clear properties from the database to force regeneration with new fields
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def clear_properties():
    """Clear all properties from the database"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_uri)
    db = client.get_database("hocs")
    
    # Clear properties collection
    result = await db.properties.delete_many({})
    print(f"✓ Deleted {result.deleted_count} properties from database")
    
    # Clear sessions collection
    result = await db.sessions.delete_many({})
    print(f"✓ Deleted {result.deleted_count} sessions from database")
    
    client.close()
    print("✓ Database cleared successfully")

if __name__ == "__main__":
    asyncio.run(clear_properties())