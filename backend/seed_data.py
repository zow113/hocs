"""
Seed script to populate MongoDB with LA County addresses
Run this script to initialize the addresses collection
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LA County addresses from frontend mockData.ts
LA_COUNTY_ADDRESSES = [
    '123 Main St, Pasadena, CA 91101',
    '456 Oak Ave, Los Angeles, CA 90012',
    '789 Elm St, Glendale, CA 91201',
    '321 Pine Rd, Burbank, CA 91502',
    '654 Maple Dr, Santa Monica, CA 90401'
]


async def seed_addresses():
    """Seed the addresses collection with LA County addresses"""
    # Connect to MongoDB
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_uri)
    db = client.get_database("hocs")
    addresses_collection = db.get_collection("addresses")
    
    try:
        # Clear existing addresses (optional - comment out if you want to keep existing data)
        result = await addresses_collection.delete_many({})
        print(f"Cleared {result.deleted_count} existing addresses")
        
        # Insert LA County addresses
        address_documents = [{"address": addr} for addr in LA_COUNTY_ADDRESSES]
        result = await addresses_collection.insert_many(address_documents)
        print(f"Successfully inserted {len(result.inserted_ids)} addresses:")
        
        for addr in LA_COUNTY_ADDRESSES:
            print(f"  - {addr}")
        
        # Create text index for autocomplete search
        await addresses_collection.create_index([("address", "text")])
        print("\nCreated text index on 'address' field for efficient searching")
        
        # Verify the data
        count = await addresses_collection.count_documents({})
        print(f"\nTotal addresses in collection: {count}")
        
    except Exception as e:
        print(f"Error seeding addresses: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    print("Starting address seeding process...\n")
    asyncio.run(seed_addresses())
    print("\nSeeding complete!")