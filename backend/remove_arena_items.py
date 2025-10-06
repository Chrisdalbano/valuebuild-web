"""
Remove Arena Mode Items from Database
Deletes items with IDs starting with 663, 664, 665, 666, 667, 668
Also removes other deprecated items that slipped through
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

ARENA_MODE_PREFIXES = ['663', '664', '665', '666', '667', '668']

# Additional deprecated items to remove (old mythic items from previous seasons)
DEPRECATED_ITEM_IDS = [
    '6655',  # Luden's Companion (old mythic)
    '6657',  # Rod of Ages (old mythic)
    '6660',  # Bami's Cinder (removed component)
    '6662',  # Iceborn Gauntlet (old mythic)
    '6665',  # Jak'Sho, The Protean (old mythic)
    '6670',  # Noonquiver (removed component)
    '6673',  # Immortal Shieldbow (old mythic)
    # NOTE: Kraken Slayer (6672) removed from this list - it's back in the game!
]


async def remove_arena_items(mongo_uri: str = "mongodb://localhost:27017"):
    """Remove Arena mode and deprecated items from database"""
    
    print("\n" + "="*60)
    print("🗑️  Removing Arena Mode & Deprecated Items")
    print("="*60 + "\n")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_uri)
    db = client['gold_league']
    items_collection = db['items_cache']
    
    # Get all items
    items = await items_collection.find({}).to_list(length=None)
    total_items = len(items)
    
    print(f"📦 Total items in database: {total_items}\n")
    
    items_to_remove = []
    
    # Find items to remove
    for item in items:
        item_id = str(item.get('id', ''))
        item_name = item.get('name', 'Unknown')
        
        # Check if Arena item (ID starts with 663, 664, etc.)
        if any(item_id.startswith(prefix) for prefix in ARENA_MODE_PREFIXES):
            items_to_remove.append((item_id, item_name, 'Arena Mode'))
        # Check if in deprecated list
        elif item_id in DEPRECATED_ITEM_IDS:
            items_to_remove.append((item_id, item_name, 'Deprecated'))
    
    if not items_to_remove:
        print("✅ No Arena or deprecated items found! Database is clean.\n")
        client.close()
        return 0
    
    print(f"🔍 Found {len(items_to_remove)} items to remove:\n")
    
    # Remove items
    removed_count = 0
    for item_id, item_name, reason in items_to_remove:
        print(f"  ⛔ Removing: {item_name} (ID: {item_id}) - {reason}")
        result = await items_collection.delete_one({'id': item_id})
        if result.deleted_count > 0:
            removed_count += 1
    
    print(f"\n✅ Removed {removed_count} items from database")
    
    # Update metadata
    metadata_collection = db['etl_metadata']
    final_count = await items_collection.count_documents({})
    
    await metadata_collection.update_one(
        {'_id': 'latest'},
        {
            '$set': {
                'itemCount': final_count,
                'arenaItemsRemoved': len(items_to_remove),
                'lastCleanup': asyncio.get_event_loop().time()
            }
        }
    )
    
    print(f"📦 Final item count: {final_count}")
    print("="*60 + "\n")
    
    client.close()
    return removed_count


async def main():
    """Run cleanup"""
    try:
        removed = await remove_arena_items()
        
        if removed > 0:
            print("✅ Database cleaned successfully!")
            print("\n💡 Refresh your browser to see the changes:")
            print("   Ctrl + Shift + R\n")
        
    except Exception as e:
        print(f"\n❌ Cleanup failed: {e}")
        print("\nMake sure MongoDB is running")


if __name__ == "__main__":
    asyncio.run(main())

