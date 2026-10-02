"""
Verify specific items are in MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_items():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client['gold_league']
    items_collection = db['items_cache']
    
    items_to_check = {
        '3094': 'Rapid Firecannon',
        '3087': 'Statikk Shiv',
        '3144': "Scout's Slingshot",
        '6672': 'Kraken Slayer'
    }
    
    print("="*70)
    print("CHECKING MONGODB FOR ITEMS")
    print("="*70)
    
    for item_id, expected_name in items_to_check.items():
        item = await items_collection.find_one({'id': item_id})
        
        if item:
            print(f"✅ FOUND - {expected_name} (ID: {item_id})")
            print(f"   Name: {item.get('name')}")
            print(f"   Cost: {item.get('cost')}g")
            print(f"   Gold Efficiency: {item.get('goldEfficiency')}%")
            print(f"   Total Gold Value: {item.get('totalGoldValue')}g")
            if 'PercentAttackSpeedMod' in item.get('statBreakdown', {}):
                as_stat = item['statBreakdown']['PercentAttackSpeedMod']
                print(f"   Attack Speed: {as_stat['amount']*100}% = {as_stat['goldValue']}g")
        else:
            print(f"❌ NOT FOUND - {expected_name} (ID: {item_id})")
        print()
    
    # Count total items
    total = await items_collection.count_documents({})
    print("="*70)
    print(f"Total items in database: {total}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_items())

