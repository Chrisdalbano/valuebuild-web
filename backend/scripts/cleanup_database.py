"""
Database Cleanup Script
Removes items with missing or invalid images from MongoDB
Run this to clean up the database after image validation improvements
"""

import asyncio
import requests
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os


async def validate_item_image(item_id: str, patch: str) -> bool:
    """Validate that item image exists and is valid"""
    image_url = f"https://ddragon.leagueoflegends.com/cdn/{patch}/img/item/{item_id}.png"
    
    try:
        # Try HEAD request first
        response = requests.head(image_url, timeout=5, allow_redirects=True)
        
        if response.status_code != 200:
            return False
        
        # Check content-type
        content_type = response.headers.get('Content-Type', '')
        if not content_type.startswith('image/'):
            return False
        
        # Check file size
        content_length = response.headers.get('Content-Length')
        if content_length:
            size = int(content_length)
            if size < 500:  # Too small
                return False
        
        return True
        
    except Exception as e:
        print(f"  ⚠️  Error validating {item_id}: {e}")
        return False


async def cleanup_invalid_images(mongo_uri: str = "mongodb://localhost:27017"):
    """Remove items with missing or invalid images from database"""
    
    print("\n" + "="*60)
    print("🧹 MongoDB Database Cleanup - Image Validation")
    print("="*60 + "\n")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_uri)
    db = client['gold_league']
    items_collection = db['items_cache']
    
    # Get all items
    items = await items_collection.find({}).to_list(length=None)
    total_items = len(items)
    
    print(f"📦 Found {total_items} items in database\n")
    print("🔍 Validating images (this may take a minute)...\n")
    
    invalid_items = []
    valid_count = 0
    
    # Validate each item's image
    for i, item in enumerate(items, 1):
        item_id = item.get('id')
        item_name = item.get('name', 'Unknown')
        patch = item.get('patch', '15.19.1')
        
        # Progress indicator
        if i % 20 == 0:
            print(f"  Progress: {i}/{total_items} items checked...")
        
        is_valid = await validate_item_image(item_id, patch)
        
        if not is_valid:
            print(f"  ❌ Invalid image: {item_name} (ID: {item_id})")
            invalid_items.append(item_id)
        else:
            valid_count += 1
    
    print(f"\n📊 Validation Summary:")
    print(f"  ✅ Valid images: {valid_count}")
    print(f"  ❌ Invalid images: {len(invalid_items)}")
    
    # Remove invalid items
    if invalid_items:
        print(f"\n🗑️  Removing {len(invalid_items)} items with invalid images...\n")
        
        for item_id in invalid_items:
            result = await items_collection.delete_one({'id': item_id})
            if result.deleted_count > 0:
                print(f"  ✅ Deleted item ID: {item_id}")
        
        print(f"\n✅ Cleanup complete! Removed {len(invalid_items)} items.")
        
        # Update metadata
        metadata_collection = db['etl_metadata']
        await metadata_collection.update_one(
            {'_id': 'latest'},
            {
                '$set': {
                    'lastCleanup': datetime.utcnow(),
                    'itemsRemoved': len(invalid_items),
                    'itemCount': valid_count
                }
            }
        )
    else:
        print("\n✅ No invalid images found! Database is clean.")
    
    # Final count
    final_count = await items_collection.count_documents({})
    print(f"\n📦 Final database count: {final_count} items")
    print("="*60 + "\n")
    
    client.close()
    return len(invalid_items)


async def main():
    """Run cleanup"""
    try:
        removed_count = await cleanup_invalid_images()
        
        if removed_count > 0:
            print("💡 Recommendation: Run ETL again to fetch items with valid images:")
            print("   python backend/test_etl.py\n")
        
    except Exception as e:
        print(f"\n❌ Cleanup failed: {e}")
        print("\nMake sure MongoDB is running:")
        print("   Check connection in MongoDB Compass")


if __name__ == "__main__":
    asyncio.run(main())

