# Gold League - Pipeline Architecture & Documentation

Complete reference for all data pipelines, processes, and system architecture.

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOLD LEAGUE ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

External API          Backend Services         Database           Frontend
─────────────         ─────────────────        ────────          ──────────
                                                                   
┌──────────┐         ┌─────────────────┐     ┌─────────┐       ┌─────────┐
│  Riot    │         │                 │     │         │       │   Vue   │
│  Data    │────────▶│   ETL Pipeline  │────▶│ MongoDB │◀──────│   App   │
│  Dragon  │         │                 │     │         │       │         │
└──────────┘         └─────────────────┘     └─────────┘       └─────────┘
                              │                    │                  │
     API Fetch                │                    │                  │
     + Validate               ▼                    ▼                  │
                     ┌─────────────────┐   ┌──────────────┐          │
                     │   Efficiency    │   │ items_cache  │          │
                     │   Calculator    │   │ Collection   │          │
                     └─────────────────┘   │              │          │
                              │             │ etl_metadata │          │
                              │             │ Collection   │          │
                              ▼             └──────────────┘          │
                     ┌─────────────────┐                             │
                     │  Gold Values    │                             │
                     │  (efficiency.py)│                             │
                     └─────────────────┘                             │
                              │                                       │
                              └───────── FastAPI Endpoints ──────────┘
                                        (http://localhost:8000)
```

---

## 🔄 ETL Pipeline Flow

### **Complete ETL Process**

```
1. EXTRACT
   │
   ├─▶ Fetch Latest Patch Version
   │   └─ GET https://ddragon.leagueoflegends.com/api/versions.json
   │
   ├─▶ Fetch All Items Data
   │   └─ GET https://ddragon.leagueoflegends.com/cdn/{patch}/data/en_US/item.json
   │
   └─▶ Result: 600+ raw items from Riot API

2. TRANSFORM
   │
   ├─▶ Filter Items (Riot Criteria)
   │   ├─ Must be available on Summoner's Rift (map "11")
   │   ├─ Must be purchasable
   │   ├─ Must have cost > 0
   │   ├─ Must have stats OR effects
   │   └─ Exclude Arena items (IDs starting with 22, 32, 44, 88, 99)
   │
   ├─▶ Filter Deprecated Items
   │   ├─ Check against DEPRECATED_ITEM_IDS blacklist
   │   ├─ Check for "mythic" keyword
   │   ├─ Check for removed/legacy keywords
   │   └─ Apply custom deprecation logic
   │
   ├─▶ Validate Images
   │   ├─ HEAD request to verify image exists
   │   ├─ Check Content-Type is image/*
   │   ├─ Verify file size > 500 bytes
   │   └─ Verify PNG signature (for GET requests)
   │
   ├─▶ Calculate Gold Efficiency
   │   ├─ Extract item stats
   │   ├─ Apply STAT_VALUES gold multipliers
   │   ├─ Calculate totalGoldValue
   │   ├─ Calculate goldEfficiency percentage
   │   └─ Generate statBreakdown
   │
   └─▶ Result: ~167 valid, enriched items

3. LOAD
   │
   ├─▶ Bulk Write to MongoDB (items_cache)
   │   ├─ Use ReplaceOne with upsert=True
   │   ├─ Preserve _id for idempotency
   │   └─ Update all fields atomically
   │
   ├─▶ Update Metadata (etl_metadata)
   │   ├─ Store patch version
   │   ├─ Store lastUpdated timestamp
   │   ├─ Store processing time
   │   ├─ Store filtered counts
   │   └─ Calculate next scheduled update
   │
   └─▶ Result: Database fully updated
```

---

## 💰 Gold Efficiency Calculation

### **How Gold Values Are Calculated**

```python
# Location: backend/efficiency.py

STAT_VALUES = {
    "FlatPhysicalDamageMod": 35,        # 35g per 1 AD
    "FlatMagicDamageMod": 20,           # 20g per 1 AP
    "FlatArmorMod": 20,                 # 20g per 1 Armor
    "FlatSpellBlockMod": 20,            # 20g per 1 MR
    "FlatHPPoolMod": 2.666667,          # 2.67g per 1 HP
    "FlatMPPoolMod": 1,                 # 1g per 1 Mana
    "PercentCritChanceMod": 4000,       # 40g per 1% (API: 1.0 = 100%)
    "PercentAttackSpeedMod": 2500,      # 250g per 10% (API: 1.0 = 100%)
    "PercentLifeStealMod": 5355,        # 53.55g per 1% (API: 1.0 = 100%)
    "AbilityHaste": 26.67,              # 26.67g per 1 AH
}
```

### **Calculation Formula**

```
For each item:

1. Total Gold Value = Σ (stat_amount × stat_gold_value)
   
   Example: Blade of the Ruined King
   - AD: 40 × 35 = 1,400g
   - AS: 0.40 × 2500 = 1,000g (40% AS)
   - Total: 2,400g

2. Gold Efficiency % = (Total Gold Value / Item Cost) × 100

   Example: BotRK costs 3,200g
   - Efficiency = (2,400 / 3,200) × 100 = 75%
   
3. Stat Breakdown = { stat_key: { amount, goldValue } }
```

### **Calculation Flow**

```
Item Stats (from API)
      │
      ▼
calculate_efficiency(item)
      │
      ├─▶ Extract stats dict
      │
      ├─▶ For each stat:
      │   ├─ Look up STAT_VALUES[stat_key]
      │   ├─ Multiply stat_value × gold_per_stat
      │   └─ Add to total_gold_value
      │
      ├─▶ Calculate efficiency %
      │   └─ (total_gold_value / cost) × 100
      │
      └─▶ Return enriched item:
          {
            ...original_item,
            goldEfficiency: 95.2,
            totalGoldValue: 3045.5,
            statBreakdown: {...},
            cost: 3200
          }
```

---

## 🎯 Data Flow: API → Database → Frontend

### **Complete Data Journey**

```
PHASE 1: EXTRACTION (ETL Pipeline)
┌─────────────────────────────────────────────────────────┐
│ Riot Data Dragon API                                    │
│ https://ddragon.leagueoflegends.com                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────┐
        │  Raw Item Data (JSON)     │
        │  {                        │
        │    "3078": {              │
        │      "name": "...",       │
        │      "stats": {...},      │
        │      "gold": {...}        │
        │    }                      │
        │  }                        │
        └───────────┬───────────────┘
                    │
                    ▼
PHASE 2: TRANSFORMATION (efficiency.py)
┌─────────────────────────────────────────────────────────┐
│  calculate_efficiency(item)                             │
│  ├─ Apply STAT_VALUES                                   │
│  ├─ Calculate goldEfficiency                            │
│  ├─ Calculate totalGoldValue                            │
│  └─ Generate statBreakdown                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────┐
        │  Enriched Item Data       │
        │  {                        │
        │    "_id": "3078",         │
        │    "name": "...",         │
        │    "goldEfficiency": 95,  │
        │    "totalGoldValue": 3045,│
        │    "statBreakdown": {...},│
        │    "imageValidated": true │
        │  }                        │
        └───────────┬───────────────┘
                    │
                    ▼
PHASE 3: STORAGE (MongoDB)
┌─────────────────────────────────────────────────────────┐
│  MongoDB Database: gold_league                          │
│  ├─ items_cache Collection (167 items)                 │
│  │  └─ Indexed by _id (item ID)                        │
│  └─ etl_metadata Collection                            │
│     └─ Stores: patch, lastUpdated, nextScheduledUpdate │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
PHASE 4: API SERVING (FastAPI)
┌─────────────────────────────────────────────────────────┐
│  GET /api/items                                         │
│  ├─ Query: {isDeprecated: false, imageValidated: true} │
│  ├─ Projection: {_id: 0}                               │
│  └─ Returns: { items: [...] }                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
PHASE 5: FRONTEND DISPLAY (Vue.js)
┌─────────────────────────────────────────────────────────┐
│  Vue Components                                         │
│  ├─ ItemTable.vue (displays all items)                 │
│  ├─ BuildOptimizer.vue (build suggestions)             │
│  ├─ ItemChart.vue (visualizations)                     │
│  └─ ItemCompare.vue (item comparisons)                 │
└─────────────────────────────────────────────────────────┘
```

---

## ⏰ When Processes Run

### **Automatic Execution**

| Trigger | Process | Schedule | Location |
|---------|---------|----------|----------|
| **Backend Startup** | Initial ETL | Once at startup (if DB empty) | `backend/app.py` line 51 |
| **Scheduled Job** | Weekly ETL | Every Monday 2:00 AM UTC | `backend/etl/data_pipeline.py` line 328 |
| **Auto Scheduler** | ETL Scheduler | Starts with backend | `backend/app.py` line 63 |

### **Manual Execution**

| Method | Command | Use Case |
|--------|---------|----------|
| **Direct Script** | `python -m etl.data_pipeline` | Test ETL, manual refresh |
| **API Endpoint** | `POST /api/items/refresh` | Force refresh from frontend |
| **API Endpoint** | `GET /api/items?force_refresh=true` | Synchronous refresh |
| **Test Script** | `python test_etl.py` | Development testing |

---

## 🛠️ Key Functions Reference

### **ETL Pipeline** (`backend/etl/data_pipeline.py`)

```python
# Class: DDragonETL
fetch_latest_patch() → str
    # Gets current League patch version from Riot API
    # Returns: "15.19.1" (example)

validate_image(item_id, patch) → bool
    # Validates item image exists and is valid
    # - HEAD request to check existence
    # - Verifies Content-Type and file size
    # Returns: True if image is valid

should_include_item(item) → bool
    # Filters items based on Riot criteria
    # - Checks map availability (SR only)
    # - Checks purchasable status
    # - Excludes deprecated/Arena items
    # Returns: True if item should be included

extract_and_transform() → int
    # Main ETL process
    # 1. Fetch data from Riot
    # 2. Filter & validate items
    # 3. Calculate gold efficiency
    # 4. Write to MongoDB
    # Returns: Number of items processed

# Class: ETLScheduler
start()
    # Starts APScheduler with weekly cron job
    # Schedule: Monday 2:00 AM UTC

stop()
    # Gracefully stops the scheduler

# Function: run_etl_now
run_etl_now(mongo_uri) → int
    # Convenience function for immediate ETL execution
    # Used by: API endpoints, manual scripts
    # Returns: Number of items processed
```

### **Gold Efficiency** (`backend/efficiency.py`)

```python
STAT_VALUES: Dict[str, float]
    # Gold values per stat point
    # Key: API stat name (e.g., "FlatPhysicalDamageMod")
    # Value: Gold per unit (e.g., 35 for AD)

calculate_efficiency(item: dict) → dict
    # Calculates gold efficiency for an item
    # Input: Raw item data from Riot API
    # Output: Item + goldEfficiency, totalGoldValue, statBreakdown
    # 
    # Process:
    # 1. Extract stats and cost
    # 2. For each stat: multiply amount × STAT_VALUES[stat]
    # 3. Sum all stat gold values
    # 4. Calculate efficiency % = (total_value / cost) × 100
    # 5. Generate detailed breakdown

get_efficiency_rating(efficiency: float) → str
    # Converts efficiency % to text rating
    # >= 120: "Excellent"
    # >= 100: "Good"
    # >= 80:  "Fair"
    # < 80:   "Poor"
```

### **FastAPI Endpoints** (`backend/app.py`)

```python
GET /
    # Health check / API info
    # Returns: Basic API information

GET /api/items
    # Fetch all valid items from MongoDB cache
    # Query params:
    #   - force_refresh: bool (triggers ETL before returning)
    # Returns: { items: [...] }

POST /api/items/refresh
    # Force ETL pipeline to run (background task)
    # Returns immediately with processing status
    # Use /api/metadata to check completion

GET /api/items/{item_id}
    # Get specific item by ID
    # Returns: Single item object or 404

GET /api/metadata
    # Get ETL pipeline status and metadata
    # Returns:
    #   - patch: Current League patch
    #   - lastUpdated: Last ETL run timestamp
    #   - nextScheduledUpdate: Next automatic run
    #   - itemCount: Number of cached items
    #   - filteredCounts: Stats on filtered items
    #   - processingTime: Last ETL duration

GET /api/health
    # System health check
    # Returns:
    #   - status: "healthy" or "unhealthy"
    #   - database: MongoDB connection status
    #   - cached_items: Item count
    #   - last_update: Last ETL timestamp
```

### **Frontend API Client** (`gold-league/src/api/items.js`)

```javascript
itemsApi.getItems()
    // Fetch all items from backend
    // Returns: Promise<{ items: [...] }>

itemsApi.refreshItems()
    // Trigger backend ETL refresh
    // Returns: Promise<{ status, message }>

itemsApi.getItem(itemId)
    // Fetch specific item
    // Returns: Promise<Item>

getValidatedItemImageUrl(item)
    // Get pre-validated image URL from backend
    // Prefers backend imageUrl (validated during ETL)
    // Falls back to constructing URL

formatStatName(statKey)
    // Convert API stat key to display name
    // "FlatPhysicalDamageMod" → "Attack Damage"

formatStatValue(statKey, value)
    // Format stat value for display
    // Converts decimals to percentages where needed
    // 0.25 → "25.0%" (for attack speed)
```

---

## 🚀 How to Run Everything

### **1. Start MongoDB**

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongo mongo

# Or use local MongoDB installation
mongod --dbpath /path/to/data
```

### **2. Start Backend**

```bash
cd backend

# Activate virtual environment (if using venv)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Start FastAPI server
python app.py

# Or with uvicorn directly:
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**What happens:**
1. Backend connects to MongoDB
2. Checks for cached data
3. If no data: Runs initial ETL (30 seconds)
4. Starts ETL scheduler for weekly updates
5. API available at `http://localhost:8000`

### **3. Start Frontend**

```bash
cd gold-league

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Production build:
npm run build
npm run preview
```

**What happens:**
1. Vite dev server starts
2. Vue app loads at `http://localhost:5173`
3. Fetches items from backend API
4. Displays item efficiency data

### **4. Manual ETL Execution**

```bash
cd backend

# Option 1: Direct module execution
python -m etl.data_pipeline

# Option 2: Test script
python test_etl.py

# Option 3: Via API (frontend or curl)
curl -X POST http://localhost:8000/api/items/refresh

# Option 4: Via API with synchronous refresh
curl http://localhost:8000/api/items?force_refresh=true
```

### **5. Check System Status**

```bash
# Check ETL metadata
curl http://localhost:8000/api/metadata

# Check system health
curl http://localhost:8000/api/health

# Check items count
curl http://localhost:8000/api/items | jq '.items | length'
```

---

## 📋 MongoDB Collections

### **items_cache**

Stores all valid, efficiency-calculated items.

**Schema:**
```javascript
{
  _id: "3078",                    // Item ID (MongoDB primary key)
  id: "3078",                     // Item ID (compatibility)
  name: "Trinity Force",          // Item name
  cost: 3333,                     // Total cost in gold
  goldEfficiency: 95.2,           // Efficiency percentage
  totalGoldValue: 3170.5,         // Total gold value from stats
  statBreakdown: {                // Per-stat breakdown
    FlatPhysicalDamageMod: {
      amount: 40,
      goldValue: 1400
    },
    PercentAttackSpeedMod: {
      amount: 0.30,
      goldValue: 750
    }
    // ... more stats
  },
  description: "<html>...",       // Item description (with HTML)
  stats: {                        // Raw stats from API
    FlatPhysicalDamageMod: 40,
    PercentAttackSpeedMod: 0.30,
    // ...
  },
  tags: ["Damage", "AttackSpeed"], // Item categories
  from: ["3044", "3057"],         // Component item IDs
  into: [],                       // Items this builds into
  imageUrl: "https://...",        // Validated image URL
  imageValidated: true,           // Image validation status
  isDeprecated: false,            // Deprecation status
  patch: "15.19.1",               // League patch version
  lastUpdated: ISODate("..."),    // Last update timestamp
  maps: { "11": true, ... },      // Map availability
  gold: {                         // Gold information
    base: 733,
    total: 3333,
    sell: 2333,
    purchasable: true
  }
}
```

**Indexes:**
- `_id` (primary key)
- `isDeprecated`
- `imageValidated`

### **etl_metadata**

Stores ETL pipeline execution metadata.

**Schema:**
```javascript
{
  _id: "latest",                     // Fixed ID for singleton
  patch: "15.19.1",                  // Current League patch
  lastUpdated: ISODate("..."),       // Last ETL execution time
  processingTime: 28.81,             // Duration in seconds
  itemCount: 167,                    // Number of items loaded
  filteredCounts: {                  // Items filtered out
    deprecated: 37,
    no_image: 0,
    riot_filter: 431,
    total: 468
  },
  nextScheduledUpdate: ISODate("..."), // Next automatic ETL run
  status: "success"                   // "success" or "error"
}
```

---

## 🔍 Debugging & Monitoring

### **Check Pipeline Status**

```bash
# View ETL metadata
curl http://localhost:8000/api/metadata | jq

# Check MongoDB directly
mongosh
> use gold_league
> db.etl_metadata.findOne({_id: "latest"})
> db.items_cache.countDocuments()
```

### **View Logs**

```bash
# Backend logs (stdout)
# Shows ETL progress, API requests, errors

# Example output:
# 📦 Latest patch: 15.19.1
# ✅ Fetched 635 raw items
# ⛔ Filtered deprecated: Cull (ID: 1083)
# 📊 Processing Summary: 167 valid items
# ✅ ETL Pipeline Complete!
```

### **Test Gold Efficiency Calculation**

```bash
cd backend
python test_api.py

# Tests:
# - API connectivity
# - Items endpoint
# - Gold efficiency calculations
# - Stat breakdown accuracy
```

### **Common Issues**

| Issue | Cause | Solution |
|-------|-------|----------|
| "No items returned" | ETL not run yet | Run `python -m etl.data_pipeline` |
| "Connection refused" | MongoDB not running | Start MongoDB |
| "Image validation failed" | Network/CDN issue | Check internet connection |
| "UnicodeEncodeError" | Windows console encoding | Set `$env:PYTHONIOENCODING="utf-8"` |

---

## 📈 Performance Metrics

### **ETL Pipeline**

- **Execution time:** ~30 seconds
- **Items processed:** 635 raw → 167 valid
- **Network requests:** ~170 (1 per item for image validation)
- **Database writes:** 167 upserts (bulk operation)

### **API Response Times**

- `GET /api/items`: ~50-100ms (cached)
- `GET /api/items/{id}`: ~10-20ms
- `GET /api/metadata`: ~5-10ms
- `POST /api/items/refresh`: ~50ms (async, returns immediately)

### **Frontend Load Time**

- Initial page load: ~500ms
- Item data fetch: ~100ms
- Image loading: Progressive (lazy load)
- Total interactive: ~1 second

---

## 🔄 Update Workflow

### **When Stat Gold Values Change**

```
1. Update backend/efficiency.py
   └─ Modify STAT_VALUES dictionary

2. Update gold-league/src/components/AboutSection.vue
   └─ Update display values for consistency

3. Run ETL pipeline to recalculate all items
   └─ python -m etl.data_pipeline

4. Restart backend (if running)
   └─ Auto-reloads new STAT_VALUES

5. Refresh frontend
   └─ Fetches newly calculated values
```

### **When League Patch Updates**

```
1. ETL runs automatically (Monday 2:00 AM UTC)
   └─ Detects new patch version
   └─ Fetches updated item data
   └─ Recalculates all efficiencies
   └─ Updates MongoDB

2. No manual intervention needed!
   └─ Backend serves updated data
   └─ Frontend displays new items
```

---

## 📝 Summary

### **Key Takeaways**

1. **Data flows:** Riot API → ETL → MongoDB → FastAPI → Vue Frontend
2. **Runs automatically:** Weekly updates every Monday at 2:00 AM UTC
3. **Manual refresh:** Via API, CLI, or test scripts
4. **Gold efficiency:** Calculated using `STAT_VALUES` in `efficiency.py`
5. **Caching:** MongoDB stores pre-calculated values for fast API responses
6. **Filtering:** Multi-stage filtering removes deprecated/invalid items
7. **Image validation:** Strict validation prevents broken images in UI

### **Important Files**

| File | Purpose |
|------|---------|
| `backend/efficiency.py` | Gold value definitions & calculation logic |
| `backend/etl/data_pipeline.py` | ETL pipeline & scheduler |
| `backend/app.py` | FastAPI server & API endpoints |
| `gold-league/src/api/items.js` | Frontend API client |
| `gold-league/src/App.vue` | Main Vue application |

---

**Last Updated:** October 6, 2025  
**Current Patch:** 15.19.1  
**Items in Database:** 167

