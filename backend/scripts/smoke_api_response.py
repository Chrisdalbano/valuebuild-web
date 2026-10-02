"""
Test if API returns the target items
"""
import requests

try:
    response = requests.get('http://localhost:8000/api/items')
    data = response.json()
    items = data.get('items', [])
    
    print(f"✅ API Response: {len(items)} total items")
    
    target_ids = ['3094', '3087', '3144', '6672']
    target_names = {
        '3094': 'Rapid Firecannon',
        '3087': 'Statikk Shiv',
        '3144': "Scout's Slingshot",
        '6672': 'Kraken Slayer'
    }
    
    found = [i for i in items if i.get('id') in target_ids]
    
    print(f"\n🔍 Target Items in API Response: {len(found)}/4")
    for item in found:
        print(f"   ✅ {item.get('name')} (ID: {item.get('id')})")
    
    missing = set(target_ids) - set(i.get('id') for i in found)
    if missing:
        print(f"\n❌ Missing from API:")
        for item_id in missing:
            print(f"   - {target_names.get(item_id)} (ID: {item_id})")
    else:
        print(f"\n✅ All target items are being served by the API!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure the backend is running: python backend/app.py")

