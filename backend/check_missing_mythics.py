"""
Check which "missing" items are actually available on Summoner's Rift
"""
import requests

# Items marked as "missing" in deprecatedItems.js
missing_items = {
    '3152': 'Hextech Rocketbelt',
    '4633': 'Riftmaker',
    '6653': "Liandry's Anguish",
    '2065': "Shurelya's Battlesong",
    '3190': 'Locket of the Iron Solari',
    '6617': 'Moonstone Renewer',
    '6630': 'Goredrinker',
    '6631': 'Stridebreaker',
    '3068': 'Sunfire Aegis',
    '4644': 'Crown of the Shattered Queen'
}

url = "https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/item.json"
response = requests.get(url)
data = response.json()
items_data = data.get('data', {})

print("="*80)
print("CHECKING 'MISSING' ITEMS ON SUMMONER'S RIFT")
print("="*80)

available_on_sr = []
not_in_api = []
not_on_sr = []

for item_id, expected_name in missing_items.items():
    if item_id not in items_data:
        not_in_api.append((item_id, expected_name))
        continue
    
    item = items_data[item_id]
    maps = item.get('maps', {})
    is_on_sr = maps.get('11', False)
    is_purchasable = item.get('gold', {}).get('purchasable', False)
    cost = item.get('gold', {}).get('total', 0)
    
    print(f"\n{item.get('name')} (ID: {item_id})")
    print(f"  Expected: {expected_name}")
    print(f"  Summoner's Rift (map 11): {is_on_sr}")
    print(f"  Purchasable: {is_purchasable}")
    print(f"  Cost: {cost}g")
    print(f"  All maps: {maps}")
    
    if is_on_sr and is_purchasable and cost > 0:
        print(f"  ✅ SHOULD BE INCLUDED")
        available_on_sr.append((item_id, item.get('name')))
    else:
        print(f"  ❌ Should remain filtered")
        not_on_sr.append((item_id, item.get('name')))

print("\n" + "="*80)
print("SUMMARY")
print("="*80)

print(f"\n✅ Available on SR ({len(available_on_sr)} items) - REMOVE FROM DEPRECATED LIST:")
for item_id, name in available_on_sr:
    print(f"  '{item_id}',  # {name}")

if not_on_sr:
    print(f"\n❌ NOT available on SR ({len(not_on_sr)} items) - KEEP IN DEPRECATED LIST:")
    for item_id, name in not_on_sr:
        print(f"  '{item_id}',  # {name}")

if not_in_api:
    print(f"\n⚠️  NOT IN API ({len(not_in_api)} items) - Already removed from game:")
    for item_id, name in not_in_api:
        print(f"  '{item_id}',  # {name}")

