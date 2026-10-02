"""
Simple test script to verify the API is working
Run this after starting the backend server
"""

import requests
import json

API_BASE = "http://localhost:8000"

def test_root():
    """Test root endpoint"""
    print("\n🔍 Testing root endpoint...")
    response = requests.get(f"{API_BASE}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✅ Root endpoint working!")

def test_items():
    """Test items endpoint"""
    print("\n🔍 Testing items endpoint...")
    response = requests.get(f"{API_BASE}/api/items")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        items = data.get("items", [])
        print(f"✅ Fetched {len(items)} items")
        
        if items:
            # Show first item as example
            item = items[0]
            print(f"\nExample item:")
            print(f"  Name: {item.get('name')}")
            print(f"  Cost: {item.get('cost')}g")
            print(f"  Gold Efficiency: {item.get('goldEfficiency')}%")
            print(f"  Gold Value: {item.get('totalGoldValue')}g")
            
            # Find most efficient item
            most_efficient = max(items, key=lambda x: x.get('goldEfficiency', 0))
            print(f"\n🏆 Most Efficient Item:")
            print(f"  {most_efficient.get('name')}: {most_efficient.get('goldEfficiency')}%")
            
            # Find least efficient item
            least_efficient = min(items, key=lambda x: x.get('goldEfficiency', 0))
            print(f"\n📉 Least Efficient Item:")
            print(f"  {least_efficient.get('name')}: {least_efficient.get('goldEfficiency')}%")
            
            # Calculate average
            avg_eff = sum(i.get('goldEfficiency', 0) for i in items) / len(items)
            print(f"\n📊 Average Efficiency: {avg_eff:.2f}%")
            
            print("\n✅ Items endpoint working!")
    else:
        print(f"❌ Failed: {response.text}")

def test_efficiency_calculation():
    """Verify gold efficiency calculations are accurate"""
    print("\n🔍 Testing efficiency calculations...")
    response = requests.get(f"{API_BASE}/api/items")
    
    if response.status_code == 200:
        data = response.json()
        items = data.get("items", [])
        
        # Test a few items
        for item in items[:3]:
            name = item.get('name')
            eff = item.get('goldEfficiency')
            cost = item.get('cost')
            value = item.get('totalGoldValue')
            
            # Verify calculation
            calculated_eff = (value / cost * 100) if cost > 0 else 0
            
            print(f"\n{name}:")
            print(f"  Cost: {cost}g")
            print(f"  Value: {value}g")
            print(f"  Efficiency: {eff}% (calculated: {calculated_eff:.2f}%)")
            
            # Allow small rounding differences
            assert abs(eff - calculated_eff) < 0.1, "Efficiency calculation mismatch!"
        
        print("\n✅ Calculations verified!")

if __name__ == "__main__":
    print("="*50)
    print("League Item Efficiency API Test")
    print("="*50)
    
    try:
        test_root()
        test_items()
        test_efficiency_calculation()
        
        print("\n" + "="*50)
        print("✅ ALL TESTS PASSED!")
        print("="*50)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API")
        print("Make sure the backend server is running:")
        print("  cd backend && python app.py")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

