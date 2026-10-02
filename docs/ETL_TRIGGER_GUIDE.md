# 🔄 ETL Pipeline Management Guide

## 📋 Overview

The ETL (Extract, Transform, Load) pipeline automatically updates item data from the Data Dragon API. This guide explains how it works and how to trigger it manually.

---

## 🤖 Automatic Scheduling (Already Configured)

### Current Schedule
- **Frequency:** Weekly
- **Day:** Every Monday
- **Time:** 2:00 AM UTC
- **Status:** ✅ **Already Running on Render**

### How It Works
1. When your backend starts on Render, it automatically initializes the ETL scheduler
2. The scheduler uses **APScheduler** to run the job at the specified time
3. **No additional configuration needed** - it's already working!

### Verification
Check your backend logs on Render. You should see:
```
📅 ETL Scheduler configured:
  ⏰ Schedule: Every Monday at 2:00 AM UTC
  🔄 Job: Update DDragon item data
✅ ETL Scheduler started!
```

---

## 🎯 Manual Trigger Options

### Option 1: API Endpoint (Recommended) ⭐

**POST Request to Refresh Endpoint:**
```bash
curl -X POST https://valuebuild-web.onrender.com/api/items/refresh
```

**Response:**
```json
{
  "message": "ETL pipeline started in background",
  "status": "processing",
  "note": "Check /api/metadata for completion status"
}
```

**Why Use This:**
- ✅ Runs in background (doesn't timeout)
- ✅ Returns immediately
- ✅ Safe for production
- ✅ Can be triggered from anywhere

**Check Status:**
```bash
curl https://valuebuild-web.onrender.com/api/metadata
```

**Response Example:**
```json
{
  "lastUpdated": "2024-10-07T10:30:00Z",
  "status": "success",
  "itemCount": 187,
  "patch": "14.20.1",
  "nextUpdate": "2024-10-14T02:00:00Z",
  "processingTime": 45.23,
  "filterStats": {
    "total": 187,
    "filtered_out": 23,
    "deprecated": 15,
    "no_stats": 5,
    "no_image": 3
  }
}
```

---

### Option 2: Query Parameter

**GET Request with force_refresh:**
```bash
curl "https://valuebuild-web.onrender.com/api/items?force_refresh=true"
```

**Why Use This:**
- ⚠️ May timeout on Render's free tier (30-second limit)
- ⚠️ Blocks until ETL completes
- ✅ Good for local testing
- ❌ Not recommended for production

---

### Option 3: Direct Script Execution (Local Only)

If you have the backend running locally:

```bash
cd backend
python -m etl.data_pipeline
```

**Output:**
```
🚀 Running ETL Pipeline (Manual Execution)...

==============================================================
📦 Starting DDragon Item Data Pipeline
==============================================================

📦 Latest patch: 14.20.1
🔍 Fetching items from DDragon API...
✅ Found 210 total items in DDragon

  ✅ Added: Infinity Edge (ID: 3031, Efficiency: 92.5%)
  ✅ Added: Trinity Force (ID: 3078, Efficiency: 87.3%)
  ...

✅ ETL Pipeline Complete!
⏱️  Processing time: 45.23s
📅 Next update scheduled: 2024-10-14 02:00 UTC

🎉 ETL Complete! Processed 187 items.
```

---

## 🚀 To Update After Backend Changes

### Step 1: Deploy to Render
```bash
git push origin main
```

Render automatically deploys when you push to `main`.

### Step 2: Trigger ETL Manually
After the backend redeploys, trigger the ETL to recalculate all items with the new health/mana regen values:

**Option A: Using curl (from your terminal):**
```bash
curl -X POST https://valuebuild-web.onrender.com/api/items/refresh
```

**Option B: Using your browser:**
Just visit this URL:
```
https://valuebuild-web.onrender.com/api/items/refresh
```

**Option C: Using Postman/Insomnia:**
- Method: `POST`
- URL: `https://valuebuild-web.onrender.com/api/items/refresh`
- No body needed

### Step 3: Verify Update
Check the metadata endpoint:
```bash
curl https://valuebuild-web.onrender.com/api/metadata
```

Look for:
- `"status": "success"`
- `"lastUpdated"` should be recent
- `"itemCount"` should show the number of items processed

---

## 📊 What Gets Updated

When the ETL runs, it:

1. **Fetches** latest patch version from Data Dragon
2. **Downloads** all item data for that patch
3. **Filters** deprecated items, non-purchasable items, etc.
4. **Validates** images to ensure they exist
5. **Calculates** gold efficiency using the values in `backend/efficiency.py`
   - ✨ **Now includes the fixed health/mana regen values!**
6. **Stores** everything in MongoDB
7. **Updates** metadata with timestamp and stats

---

## 🔍 Monitoring

### Check Backend Logs on Render

1. Go to https://dashboard.render.com
2. Select your `valuebuild-web` service
3. Click "Logs" tab
4. Look for ETL-related messages:

```
🔄 Force refresh requested, running ETL...
📦 Latest patch: 14.20.1
✅ ETL Pipeline Complete!
⏱️  Processing time: 45.23s
```

### Check Frontend

After ETL completes:
1. Visit https://buildvalue.chrisdalbano.com
2. Items with health/mana regen should now show correct gold values
3. Gold efficiency percentages will be recalculated

---

## ⏰ ETL Schedule Details

**Current Configuration:**
- **File:** `backend/etl/data_pipeline.py`
- **Class:** `ETLScheduler`
- **Trigger:** `CronTrigger(day_of_week='mon', hour=2, minute=0)`
- **Timezone:** UTC

**To Change Schedule:**
Edit line 345 in `backend/etl/data_pipeline.py`:
```python
self.scheduler.add_job(
    self.run_etl_job,
    CronTrigger(day_of_week='mon', hour=2, minute=0),  # Change this
    # ...
)
```

**Examples:**
```python
# Daily at 3 AM UTC
CronTrigger(hour=3, minute=0)

# Every 6 hours
CronTrigger(hour='*/6')

# Twice per week (Monday and Thursday at 2 AM)
CronTrigger(day_of_week='mon,thu', hour=2, minute=0)
```

---

## 🐛 Troubleshooting

### ETL Not Running
**Check:**
1. Backend is deployed and running on Render
2. `MONGO_URI` environment variable is set correctly
3. MongoDB Atlas allows connections from Render's IP

**Solution:** Manually trigger using the API endpoint

### ETL Fails
**Check the logs for errors:**
- MongoDB connection issues?
- Data Dragon API down?
- Image validation failures?

**Solution:** Check `/api/metadata` for error details

### Items Not Updating
**Possible causes:**
1. ETL hasn't run yet (check `lastUpdated` in metadata)
2. Frontend is caching old data (hard refresh: Ctrl+Shift+R)
3. CDN cache on Netlify (can take a few minutes)

**Solution:** Clear browser cache and check metadata endpoint

---

## 🎯 Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Trigger ETL | `POST` | `/api/items/refresh` |
| Get Status | `GET` | `/api/metadata` |
| Get Items | `GET` | `/api/items` |
| Force Refresh Items | `GET` | `/api/items?force_refresh=true` |
| Health Check | `GET` | `/api/health` |

---

## ✅ Recommended Workflow

**After Backend Changes (like the health regen fix):**

1. **Commit and push:**
   ```bash
   git add backend/efficiency.py
   git commit -m "Fix health regen gold values"
   git push origin main
   ```

2. **Wait for Render deploy** (2-3 minutes)
   - Check: https://dashboard.render.com

3. **Trigger ETL:**
   ```bash
   curl -X POST https://valuebuild-web.onrender.com/api/items/refresh
   ```

4. **Verify completion** (wait 1-2 minutes):
   ```bash
   curl https://valuebuild-web.onrender.com/api/metadata
   ```

5. **Test frontend:**
   - Visit https://buildvalue.chrisdalbano.com
   - Check an item with health regen
   - Verify gold efficiency is correct

---

## 📝 Notes

- **Render Free Tier:** Spins down after 15 minutes of inactivity
- **First Request:** May take 30+ seconds (cold start)
- **ETL Duration:** ~45-60 seconds for full pipeline
- **Scheduled Job:** Persists even through restarts
- **No Cron Jobs on Render Free:** The scheduler runs **within your app**, not as a separate cron job

---

**Need Help?**
Check the logs on Render or the `/api/metadata` endpoint for detailed status information.

