"""
MongoDB database configuration (Optional)
Uncomment and configure to enable persistent caching
"""

# from motor.motor_asyncio import AsyncIOMotorClient
# from pymongo import MongoClient
# import os
# from dotenv import load_dotenv

# load_dotenv()

# MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
# DB_NAME = os.getenv("MONGODB_DB", "league_items")

# # Async MongoDB client (for FastAPI)
# async def get_database():
#     client = AsyncIOMotorClient(MONGODB_URI)
#     return client[DB_NAME]

# # Sync MongoDB client (for scripts)
# def get_database_sync():
#     client = MongoClient(MONGODB_URI)
#     return client[DB_NAME]

# Example usage:
# async def save_items(items):
#     db = await get_database()
#     collection = db.items
#     await collection.delete_many({})  # Clear old data
#     await collection.insert_many(items)

# async def load_items():
#     db = await get_database()
#     collection = db.items
#     items = await collection.find().to_list(length=None)
#     return items

# For MVP, we're using in-memory caching in app.py
# Uncomment above code to enable MongoDB persistence

