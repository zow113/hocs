#!/usr/bin/env python3
"""Test MongoDB connection to diagnose authentication issues"""

import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

async def test_connection():
    """Test MongoDB connection and authentication"""
    mongo_uri = os.getenv("MONGO_URI")
    
    if not mongo_uri:
        print("❌ ERROR: MONGO_URI not found in .env file")
        return False
    
    print(f"📡 Testing connection to MongoDB Atlas...")
    print(f"🔗 URI: {mongo_uri[:50]}...{mongo_uri[-20:]}")  # Show partial URI for security
    
    try:
        # Create client with shorter timeout for faster feedback
        client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection with ping
        print("🔄 Attempting to ping database...")
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Test database access
        db = client.get_database("hocs")
        print(f"✅ Successfully accessed 'hocs' database")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"✅ Found {len(collections)} collections: {collections}")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ CONNECTION FAILED")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {error_msg}")
        
        # Provide specific guidance based on error
        if "authentication failed" in error_msg.lower():
            print("\n🔍 DIAGNOSIS: Authentication Failed")
            print("Possible causes:")
            print("  1. Incorrect username or password in MONGO_URI")
            print("  2. Database user doesn't exist in MongoDB Atlas")
            print("  3. User doesn't have permissions for 'hocs' database")
            print("\n💡 SOLUTIONS:")
            print("  • Check MongoDB Atlas → Database Access → Database Users")
            print("  • Verify username is: andytzou_db_user")
            print("  • Reset password if needed and update .env file")
            print("  • Ensure user has 'readWrite' role on 'hocs' database")
            
        elif "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            print("\n🔍 DIAGNOSIS: Connection Timeout")
            print("Possible causes:")
            print("  1. IP address not whitelisted in MongoDB Atlas")
            print("  2. Network/firewall blocking connection")
            print("  3. MongoDB cluster is paused or deleted")
            print("\n💡 SOLUTIONS:")
            print("  • Check MongoDB Atlas → Network Access → IP Access List")
            print("  • Add your current IP or use 0.0.0.0/0 for testing")
            print("  • Verify cluster is active in MongoDB Atlas")
            
        elif "dns" in error_msg.lower():
            print("\n🔍 DIAGNOSIS: DNS Resolution Failed")
            print("Possible causes:")
            print("  1. Invalid cluster hostname in MONGO_URI")
            print("  2. Network DNS issues")
            print("\n💡 SOLUTIONS:")
            print("  • Verify cluster hostname in MongoDB Atlas")
            print("  • Check internet connection")
        
        return False

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    sys.exit(0 if result else 1)