"""
Test the actual filtering logic
"""
import requests
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the actual ETL class
from etl.data_pipeline import DDragonETL

# Fetch from DDragon
url = "https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/item.json"
response = requests.get(url)
data = response.json()
items_data = data.get('data', {})

# Create ETL instance
etl = DDragonETL()

items_to_test = {
    '3094': 'Rapid Firecannon',
    '3087': 'Statikk Shiv',
    '3144': "Scout's Slingshot",
    '6672': 'Kraken Slayer'
}

print("Testing actual ETL filtering logic:")
print("="*70)

for item_id, expected_name in items_to_test.items():
    if item_id in items_data:
        item = items_data[item_id]
        item['id'] = item_id
        
        should_include = etl.should_include_item(item)
        
        status = "✅ INCLUDED" if should_include else "❌ FILTERED"
        print(f"{status} - {expected_name} (ID: {item_id})")
        
        if not should_include:
            print(f"   Name: {item.get('name')}")
            print(f"   Maps: {item.get('maps', {})}")
            print(f"   Description preview: {item.get('description', '')[:100]}...")
    else:
        print(f"❌ NOT IN API - {expected_name} (ID: {item_id})")

print("="*70)

