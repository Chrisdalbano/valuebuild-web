"""
Diagnose why Statikk Shiv and Rapid Firecannon are still missing
"""
import requests
import sys
sys.path.append('.')
from etl.deprecated_items import is_item_deprecated, DEPRECATED_ITEM_IDS, DEPRECATED_KEYWORDS

# Fetch from DDragon
url = "https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/item.json"
response = requests.get(url)
data = response.json()
items = data.get('data', {})

items_to_check = {
    '3094': 'Rapid Firecannon',
    '3087': 'Statikk Shiv'
}

for item_id, expected_name in items_to_check.items():
    print("="*70)
    print(f"CHECKING: {expected_name} (ID: {item_id})")
    print("="*70)
    
    if item_id not in items:
        print(f"❌ NOT FOUND in DDragon API!")
        continue
    
    item = items[item_id]
    item['id'] = item_id
    
    print(f"\n✅ Found in DDragon API")
    print(f"   Name: {item.get('name')}")
    print(f"   Purchasable: {item.get('gold', {}).get('purchasable')}")
    print(f"   Cost: {item.get('gold', {}).get('total')}g")
    print(f"   Maps: {item.get('maps', {})}")
    print(f"   Map 11 (SR): {item.get('maps', {}).get('11', False)}")
    
    # Check is_item_deprecated
    is_deprecated = is_item_deprecated(item)
    print(f"\n🔍 is_item_deprecated() result: {is_deprecated}")
    
    if is_deprecated:
        print(f"   ❌ This item is being filtered as deprecated!")
        
        # Check why
        description = (item.get('description', '') or '').lower()
        name = (item.get('name', '') or '').lower()
        
        # Check description
        found_desc_kw = [kw for kw in DEPRECATED_KEYWORDS if kw in description]
        if found_desc_kw:
            print(f"   Reason: Description contains: {found_desc_kw}")
            print(f"   Description: {description[:300]}...")
        
        # Check name
        found_name_kw = [kw for kw in DEPRECATED_KEYWORDS if kw in name]
        if found_name_kw:
            print(f"   Reason: Name contains: {found_name_kw}")
    else:
        print(f"   ✅ Not filtered by is_item_deprecated()")
    
    # Check should_include_item logic from data_pipeline.py
    print(f"\n🔍 Checking data_pipeline.py should_include_item logic:")
    
    # Check deprecated keywords in data_pipeline (hardcoded list)
    hardcoded_keywords = ["removed", "mythic", "deprecated", "old", "legacy"]
    description = (item.get('description', '') or '').lower()
    name_lower = (item.get('name', '') or '').lower()
    
    found_hardcoded = [kw for kw in hardcoded_keywords if kw in description or kw in name_lower]
    if found_hardcoded:
        print(f"   ❌ PROBLEM: data_pipeline.py has hardcoded deprecated keywords!")
        print(f"   Found in item: {found_hardcoded}")
        print(f"   This overrides the is_item_deprecated() check!")
    else:
        print(f"   ✅ Passes data_pipeline.py keyword check")
    
    print()

print("="*70)
print("\n💡 SOLUTION:")
print("If items are filtered by data_pipeline.py hardcoded keywords,")
print("update line 116 in backend/etl/data_pipeline.py to match")
print("the DEPRECATED_KEYWORDS list in deprecated_items.py")

