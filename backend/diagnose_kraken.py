"""
Diagnose why Kraken Slayer is being filtered
"""
import requests
import sys
sys.path.append('.')
from etl.deprecated_items import is_item_deprecated, DEPRECATED_ITEM_IDS, DEPRECATED_KEYWORDS, ARENA_MODE_PREFIXES

# Fetch from DDragon
url = "https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/item.json"
response = requests.get(url)
data = response.json()
items = data.get('data', {})

item_id = '6672'
if item_id in items:
    item = items[item_id]
    item['id'] = item_id
    
    print("="*70)
    print(f"DIAGNOSING: {item.get('name')} (ID: {item_id})")
    print("="*70)
    
    print(f"\n📋 Basic Info:")
    print(f"  Name: {item.get('name')}")
    print(f"  Purchasable: {item.get('gold', {}).get('purchasable')}")
    print(f"  Cost: {item.get('gold', {}).get('total')}g")
    print(f"  Maps: {item.get('maps', {})}")
    
    print(f"\n🔍 Checking is_item_deprecated():")
    print(f"  Result: {is_item_deprecated(item)}")
    
    print(f"\n  Step-by-step checks:")
    
    # Check 1: ID in deprecated set
    print(f"  1. ID in DEPRECATED_ITEM_IDS? {item_id in DEPRECATED_ITEM_IDS}")
    if item_id in DEPRECATED_ITEM_IDS:
        print(f"     ❌ FILTERED: Item ID is blacklisted")
    
    # Check 2: Arena prefix
    is_arena = any(item_id.startswith(prefix) for prefix in ARENA_MODE_PREFIXES)
    print(f"  2. ID starts with Arena prefix? {is_arena}")
    if is_arena:
        print(f"     ❌ FILTERED: Arena mode item")
    
    # Check 3: Description keywords
    description = (item.get('description', '') or '').lower()
    found_desc_kw = [kw for kw in DEPRECATED_KEYWORDS if kw in description]
    print(f"  3. Description contains deprecated keywords? {bool(found_desc_kw)}")
    if found_desc_kw:
        print(f"     ❌ FILTERED: Found keywords in description: {found_desc_kw}")
        print(f"     Description: {description[:200]}...")
    
    # Check 4: Name keywords
    name = (item.get('name', '') or '').lower()
    found_name_kw = [kw for kw in DEPRECATED_KEYWORDS if kw in name]
    print(f"  4. Name contains deprecated keywords? {bool(found_name_kw)}")
    if found_name_kw:
        print(f"     ❌ FILTERED: Found keywords in name: {found_name_kw}")
    
    print(f"\n📝 Full Description:")
    print(f"{description}")
    
    print(f"\n💡 DEPRECATED_KEYWORDS list: {DEPRECATED_KEYWORDS}")
    print(f"💡 DEPRECATED_ITEM_IDS contains: {sorted(DEPRECATED_ITEM_IDS)}")
else:
    print(f"Item {item_id} not found in DDragon API")

