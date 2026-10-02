"""
Check why specific items are missing from the database
"""
import requests
import json

# Items to check
items_to_find = [
    "Kraken Slayer",
    "Rapid Firecannon", 
    "Statikk Shiv",
    "Scout's Slingshot"
]

# Fetch from DDragon
print("🔍 Checking DDragon API for missing items...\n")
url = "https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/item.json"
response = requests.get(url)
data = response.json()
items = data.get('data', {})

print(f"Total items in DDragon: {len(items)}\n")
print("="*70)

for search_name in items_to_find:
    print(f"\n🔎 Searching for: {search_name}")
    print("-"*70)
    
    found = False
    for item_id, item_data in items.items():
        item_name = item_data.get('name', '')
        
        # Check if search term is in the item name
        if search_name.lower() in item_name.lower():
            found = True
            print(f"✅ FOUND!")
            print(f"   ID: {item_id}")
            print(f"   Name: {item_name}")
            print(f"   Purchasable: {item_data.get('gold', {}).get('purchasable', False)}")
            print(f"   Cost: {item_data.get('gold', {}).get('total', 0)}g")
            print(f"   Maps: {item_data.get('maps', {})}")
            print(f"   Description preview: {item_data.get('description', '')[:100]}...")
            
            # Check why it might be filtered
            print(f"\n   ⚠️  Potential filter reasons:")
            
            # Check maps
            if not item_data.get('maps', {}).get('11', False):
                print(f"   ❌ Not available on Summoner's Rift (map 11)")
            else:
                print(f"   ✅ Available on Summoner's Rift")
                
            # Check purchasable
            if not item_data.get('gold', {}).get('purchasable', False):
                print(f"   ❌ Not purchasable")
            else:
                print(f"   ✅ Purchasable")
                
            # Check cost
            cost = item_data.get('gold', {}).get('total', 0)
            if cost <= 0:
                print(f"   ❌ Cost is {cost}g (must be > 0)")
            else:
                print(f"   ✅ Cost is {cost}g")
            
            # Check stats
            stats = item_data.get('stats', {})
            if not stats:
                print(f"   ⚠️  No stats provided")
            else:
                print(f"   ✅ Has stats: {list(stats.keys())}")
            
            # Check description for keywords
            description = item_data.get('description', '').lower()
            deprecated_keywords = ['mythic', 'removed', 'deprecated', 'old', 'legacy']
            found_keywords = [kw for kw in deprecated_keywords if kw in description]
            if found_keywords:
                print(f"   ❌ Contains deprecated keywords: {found_keywords}")
            else:
                print(f"   ✅ No deprecated keywords in description")
            
            # Check if ID is in arena/deprecated lists
            if len(item_id) >= 5 and (item_id.startswith('22') or item_id.startswith('32') or 
                                      item_id.startswith('44') or item_id.startswith('88') or 
                                      item_id.startswith('99')):
                print(f"   ❌ ID starts with Arena mode prefix")
            else:
                print(f"   ✅ ID doesn't match Arena mode pattern")
            
    if not found:
        print(f"❌ NOT FOUND in DDragon API")
        print(f"   This item may have been removed from the game")

print("\n" + "="*70)
print("\n💡 Summary:")
print("If an item is in DDragon but not in your database, check:")
print("1. backend/etl/deprecated_items.py - DEPRECATED_ITEM_IDS")
print("2. backend/remove_arena_items.py - DEPRECATED_ITEM_IDS")
print("3. ETL logs when running: python -m etl.data_pipeline")

