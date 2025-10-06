# Data Source Research - Public Endpoints

## 🎯 Goal
Find public, no-API-key endpoints for League of Legends stats.

## 🔍 Investigation Steps

### 1. U.GG Investigation
**Steps:**
1. Open https://u.gg in browser
2. Open DevTools (F12) → Network tab
3. Navigate to a champion page (e.g., Jinx)
4. Filter by "Fetch/XHR"
5. Look for JSON responses with stats

**Expected Endpoints:**
- `https://stats2.u.gg/lol/1.5/champion_stats/{region}/{tier}/{champion_id}`
- Parameters: region (world, na, euw), tier (platinum_plus, diamond_plus)

**Sample Request:**
```bash
curl "https://stats2.u.gg/lol/1.5/champion_stats/world/platinum_plus/222" \
  -H "User-Agent: BuildValue"
```

### 2. LoLalytics Investigation
**URL:** https://lolalytics.com

**Steps:**
1. Open champion page
2. Check Network tab for API calls
3. Look for stats endpoints

**Potential Endpoint:**
- `https://ax.lolalytics.com/tierlist/1/?tier=diamond_plus&patch=15.19`

### 3. OP.GG Investigation
**URL:** https://www.op.gg

**Note:** OP.GG has region-specific versions. Check:
- NA: https://na.op.gg
- EUW: https://euw.op.gg

**Steps:**
1. Search for champion
2. Inspect build/stats section
3. Find JSON endpoints

### 4. Alternative Sources

#### Community Datasets
- **Kaggle:** Search "League of Legends matches 2024"
- **GitHub:** Look for aggregated stats repositories
- **Google Dataset Search:** "League of Legends champion statistics"

#### Data Dragon (Limited)
Already integrated, but doesn't have match stats:
```
https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/champion.json
```

## 📊 Data We Need

### Champion Stats
```json
{
  "champion_id": "222",
  "champion_name": "Jinx",
  "role": "ADC",
  "tier": "diamond_plus",
  "winrate": 51.2,
  "pickrate": 12.5,
  "banrate": 3.2,
  "games": 125000
}
```

### Item Build Data
```json
{
  "champion_id": "222",
  "builds": [
    {
      "items": ["3031", "3094", "3087"],
      "winrate": 52.1,
      "pickrate": 35.2,
      "games": 44000
    }
  ]
}
```

### Item Performance
```json
{
  "item_id": "3031",
  "total_games": 500000,
  "avg_winrate": 51.5,
  "top_champions": [
    {"id": "222", "winrate": 52.1, "pickrate": 85.0}
  ]
}
```

## 🧪 Testing Script

Create a test script to check endpoints:

```python
# backend/insights/test_endpoints.py
import httpx
import asyncio

async def test_endpoint(url: str, name: str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                print(f"✅ {name}: SUCCESS")
                print(f"   Data sample: {response.text[:200]}...")
                return True
            else:
                print(f"❌ {name}: Failed ({response.status_code})")
                return False
    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        return False

async def main():
    endpoints = [
        ("https://stats2.u.gg/lol/1.5/champion_stats/world/platinum_plus/222", "U.GG - Jinx Stats"),
        ("https://ax.lolalytics.com/tierlist/1/?tier=diamond_plus&patch=15.19", "LoLalytics - Tier List"),
        # Add more as discovered
    ]
    
    for url, name in endpoints:
        await test_endpoint(url, name)
        await asyncio.sleep(2)  # Rate limit

if __name__ == "__main__":
    asyncio.run(main())
```

## 📝 Notes

### Rate Limiting
- Wait 5 seconds between requests
- Cache responses for 24 hours
- Use respectful User-Agent

### Legal Considerations
- Only use publicly accessible data
- Don't circumvent authentication
- Respect robots.txt
- Cache to reduce server load
- Provide attribution

### Fallback Plan
If no public APIs are found:
1. Use historical datasets (Kaggle, GitHub)
2. Manual data entry for top champions
3. Focus on gold efficiency analysis (local)
4. Consider optional Riot API key for users who want live data

## ✅ Action Items

- [ ] Manually test U.GG endpoints
- [ ] Check LoLalytics network tab
- [ ] Search Kaggle for datasets
- [ ] Test endpoint accessibility
- [ ] Document working endpoints
- [ ] Create data fetcher
- [ ] Implement caching
- [ ] Build API endpoints

