# 🚀 Render Deployment Guide

Complete guide to deploy **Gold League** using Render (backend) and Netlify (frontend).

---

## 🎯 Why Render?

✅ **Free tier available** (unlike Heroku)
✅ **Easy deployment** from GitHub
✅ **Automatic HTTPS**
✅ **Native Python/FastAPI support**
✅ **Background workers** (for ETL)
✅ **Better pricing** than Heroku

---

## 📊 Deployment Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Vue 3 + Vite  │         │  FastAPI + Py   │         │  MongoDB Atlas  │
│    (NETLIFY)    │ HTTPS   │    (RENDER)     │ Cloud   │   (Database)    │
│      FREE       ├────────▶│   FREE/$7/mo    ├────────▶│      FREE       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Frontend                    Backend API              Persistent Store
```

**Total Cost**: FREE (with limitations) or $7/month for better performance

---

## Part 1: MongoDB Atlas Setup (5 minutes)

### Step 1: Create Cluster

1. Go to https://cloud.mongodb.com/
2. Sign up or log in
3. Click **"Build a Database"**
4. Choose **FREE M0** cluster
5. Select cloud provider & region (closest to your users)
6. Name cluster: `gold-league-prod`
7. Click **"Create"** (takes 3-5 minutes)

### Step 2: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `gold_league_admin`
5. **Password**: Click "Autogenerate Secure Password" (save it!)
6. **Database User Privileges**: Read and write to any database
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. This adds `0.0.0.0/0` to whitelist
5. Click **"Confirm"**

> ⚠️ **Note**: `0.0.0.0/0` is safe because you still need username/password

### Step 4: Get Connection String

1. Go back to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Python**, Version: **3.11 or later**
5. Copy the connection string:
   ```
   mongodb+srv://gold_league_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name at the end:
   ```
   mongodb+srv://gold_league_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gold_league?retryWrites=true&w=majority
   ```
8. **Save this connection string securely!**

---

## Part 2: Render Backend Deployment (10 minutes)

### Step 1: Create Render Account

1. Go to https://render.com/
2. Click **"Get Started"**
3. Sign up with GitHub (recommended for easy deployment)

### Step 2: Create Web Service

1. Click **"New +"** in dashboard
2. Select **"Web Service"**
3. Connect your GitHub repository: `gold-league`
4. Click **"Connect"** next to your repo

### Step 3: Configure Service

Fill in these settings:

**Basic Settings:**
- **Name**: `gold-league-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or `production`)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build Settings:**
- **Build Command**: `pip install -r requirements.txt`
  - Or use: `./build.sh` (if you prefer the script)
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
  - Or use: `./start.sh`

**Instance Type:**
- **Free** (512 MB RAM, shared CPU, spins down after 15 min inactivity)
- Or **Starter** ($7/month, 512 MB RAM, always on, no spin down)

> 💡 **Free tier is fine for testing**. Upgrade to Starter for production.

### Step 4: Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `http://localhost:5173` (update after Netlify deploy) |
| `PYTHON_VERSION` | `3.11.9` |

> 🔐 **Important**: Never commit `MONGO_URI` to git!

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Start your FastAPI app
3. Watch the deployment logs
4. Wait for **"Your service is live 🎉"**

### Step 6: Verify Deployment

After deployment completes, you'll get a URL like:
```
https://gold-league-backend.onrender.com
```

Test these endpoints:

```bash
# Root endpoint
curl https://gold-league-backend.onrender.com/

# Health check
curl https://gold-league-backend.onrender.com/api/health

# Items (should work after ETL runs)
curl https://gold-league-backend.onrender.com/api/items

# Metadata (ETL status)
curl https://gold-league-backend.onrender.com/api/metadata
```

**Expected**: Backend responds with JSON. ETL will run automatically on first startup.

### Step 7: Enable Auto-Deploy (Optional)

1. In your Render service settings
2. **Auto-Deploy**: Should be **"Yes"** by default
3. Now every push to `main` branch auto-deploys

---

## Part 3: Netlify Frontend Deployment (5 minutes)

### Step 1: Create Netlify Account

1. Go to https://app.netlify.com/
2. Sign up with GitHub (recommended)

### Step 2: Import Project

1. Click **"Add new site"**
2. Choose **"Import an existing project"**
3. Select **"Deploy with GitHub"**
4. Authorize Netlify to access your repositories
5. Choose your `gold-league` repository

### Step 3: Configure Build Settings

**Site Settings:**
- **Branch to deploy**: `main` (or `production`)
- **Base directory**: `gold-league`
- **Build command**: `npm run build`
- **Publish directory**: `gold-league/dist`

### Step 4: Add Environment Variables

Click **"Show advanced"** → **"New variable"**

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://gold-league-backend.onrender.com` (your Render URL) |
| `VITE_ENVIRONMENT` | `production` |

### Step 5: Deploy Site

1. Click **"Deploy site"**
2. Netlify will:
   - Clone repository
   - Install dependencies (`npm install`)
   - Build app (`npm run build`)
   - Deploy to CDN
3. Wait for **"Site is live"**

You'll get a URL like:
```
https://gold-league-12345.netlify.app
```

### Step 6: Test Frontend

1. Open your Netlify URL in browser
2. Check browser console for errors (F12)
3. Verify items are loading
4. Check Network tab for API calls

---

## Part 4: Connect Frontend & Backend (2 minutes)

### Update Backend CORS

Now that you have your Netlify URL, update the backend:

1. Go to Render dashboard
2. Select your web service
3. Go to **"Environment"** tab
4. Find `CORS_ORIGINS`
5. Update value to:
   ```
   https://gold-league-12345.netlify.app
   ```
   (use your actual Netlify URL)
6. Click **"Save Changes"**
7. Render will automatically redeploy with new settings

### Verify Connection

1. Open your Netlify site
2. Open browser DevTools (F12)
3. Go to Network tab
4. Reload page
5. Verify API calls to Render backend succeed (Status 200)
6. Check for CORS errors (there should be none)

---

## 🎉 Deployment Complete!

Your app is now live:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: MongoDB Atlas

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid Plan | Recommendation |
|---------|-----------|-----------|----------------|
| **MongoDB Atlas** | 512MB M0 | $10/mo M10 | Free is enough |
| **Render** | 512MB, spins down | $7/mo always-on | Start free, upgrade if needed |
| **Netlify** | 100GB bandwidth | $19/mo Pro | Free is enough |
| **Total** | **FREE** | **$7-17/month** | **Start FREE** |

### Free Tier Limitations

**Render Free:**
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ✅ Good for development/testing
- 💡 Upgrade to Starter ($7/mo) for production (always-on)

**Render Starter ($7/mo):**
- ✅ Always on (no spin-down)
- ✅ Faster response times
- ✅ Better for production
- ✅ Still cheaper than Heroku

---

## 🔧 Managing Your Deployment

### View Render Logs

1. Render Dashboard → Your service
2. Click **"Logs"** tab
3. View real-time logs
4. Filter by date/time

### Restart Render Service

1. Render Dashboard → Your service
2. Click **"Manual Deploy"** dropdown
3. Select **"Clear build cache & deploy"**

### Update Environment Variables

1. Render Dashboard → Your service
2. Click **"Environment"** tab
3. Edit variables
4. Click **"Save Changes"** (auto-redeploys)

### Manual Deploy

1. Render Dashboard → Your service
2. Click **"Manual Deploy"** dropdown
3. Select **"Deploy latest commit"**

### View Netlify Logs

1. Netlify Dashboard → Your site
2. Click **"Deploys"**
3. Click on a specific deploy
4. View **"Deploy log"**

### Trigger Netlify Rebuild

1. Netlify Dashboard → Your site
2. Click **"Deploys"**
3. Click **"Trigger deploy"**
4. Select **"Clear cache and deploy site"**

---

## 🐛 Troubleshooting

### Issue: Backend Not Starting

**Symptoms**: Render build succeeds but service fails to start

**Solution**:
```bash
1. Check Render logs for errors
2. Verify MONGO_URI is set correctly
3. Check that requirements.txt has all dependencies
4. Verify start command: uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Issue: MongoDB Connection Failed

**Symptoms**: Backend starts but crashes, "connection timeout" errors

**Solution**:
```bash
1. Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
2. Verify connection string format is correct
3. Test connection string locally first
4. Check MongoDB user has correct permissions
```

### Issue: CORS Errors

**Symptoms**: Frontend shows CORS errors in console

**Solution**:
```bash
1. Update CORS_ORIGINS in Render environment variables
2. Use exact Netlify URL (https://your-site.netlify.app)
3. No trailing slash in URL
4. Save and wait for Render to redeploy
5. Clear browser cache and reload
```

### Issue: Frontend Not Loading Items

**Symptoms**: Empty table, no data displayed

**Solution**:
```bash
1. Check VITE_API_BASE_URL in Netlify env vars
2. Verify backend /api/health endpoint works
3. Check backend /api/metadata to see if ETL ran
4. Check browser Network tab for API call failures
5. Manually trigger ETL: POST /api/items/refresh
```

### Issue: Render Free Tier Spin-Down

**Symptoms**: First request takes 30-60 seconds

**Solution**:
```bash
Option 1: Upgrade to Starter plan ($7/mo) - always on
Option 2: Use a service like UptimeRobot to ping every 10 min
Option 3: Accept the delay (it's a free tier limitation)
```

### Issue: ETL Not Running

**Symptoms**: No items in database, metadata shows no ETL runs

**Solution**:
```bash
1. Check Render logs for ETL errors
2. Verify Riot DDragon API is accessible
3. Check MongoDB connection is working
4. Manually trigger: curl -X POST https://your-backend.onrender.com/api/items/refresh
5. Check logs for "Initial ETL complete"
```

---

## 🔄 Updating Your App

### Backend Updates

```bash
# Make changes in backend/
cd backend
# Edit files

# Commit and push
cd ..
git add backend/
git commit -m "Update backend"
git push origin main

# Render auto-deploys from main branch
# Watch deployment in Render dashboard
```

### Frontend Updates

```bash
# Make changes in gold-league/
cd gold-league
# Edit files

# Commit and push
cd ..
git add gold-league/
git commit -m "Update frontend"
git push origin main

# Netlify auto-deploys from main branch
# Watch deployment in Netlify dashboard
```

### Manual ETL Refresh

```bash
curl -X POST https://your-backend.onrender.com/api/items/refresh
```

---

## 📈 Monitoring

### Health Checks

**Backend Health:**
```bash
curl https://your-backend.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "cached_items": 150,
  "last_update": "2025-10-06T12:00:00Z"
}
```

**Frontend Health:**
- Visit: `https://your-site.netlify.app/`
- Should load without errors
- Check browser console (F12)

**ETL Status:**
```bash
curl https://your-backend.onrender.com/api/metadata
```

### Set Up Uptime Monitoring (Optional)

Use **UptimeRobot** (free) to monitor your app:

1. Sign up at https://uptimerobot.com/
2. Add two monitors:
   - **Backend**: `https://your-backend.onrender.com/api/health`
   - **Frontend**: `https://your-site.netlify.app/`
3. Set interval: 5 minutes
4. Enable email alerts

**Bonus**: Pinging your Render backend every 5 minutes keeps it from spinning down (if on free tier)

---

## 🔐 Security Best Practices

✅ **Environment Variables**
- Never commit `.env` files to git
- Store secrets only in Render/Netlify dashboards

✅ **MongoDB Atlas**
- Use strong password
- Keep connection string secret
- IP whitelist is 0.0.0.0/0 (but still need auth)

✅ **CORS Configuration**
- Only allow specific origins (your Netlify URL)
- Don't use wildcards (*) in production

✅ **HTTPS**
- Both Render and Netlify provide free HTTPS
- All traffic is encrypted

---

## 🎯 Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured with strong password
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Connection string saved securely
- [ ] Render account created
- [ ] Render web service deployed
- [ ] Environment variables set in Render
- [ ] Backend health check passes
- [ ] ETL has run successfully
- [ ] Netlify account created
- [ ] Frontend site deployed
- [ ] Environment variables set in Netlify
- [ ] Frontend loads without errors
- [ ] Backend CORS includes Netlify URL
- [ ] API calls work from frontend
- [ ] Items display correctly
- [ ] No console errors
- [ ] MongoDB has data
- [ ] Uptime monitoring configured (optional)

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Netlify Docs**: https://docs.netlify.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **FastAPI**: https://fastapi.tiangolo.com/deployment/

---

## 🚀 Next Steps

1. ✅ Backend deployed on Render
2. ✅ Frontend deployed on Netlify
3. ✅ Database on MongoDB Atlas
4. 🎯 Consider custom domain (optional)
5. 📊 Set up analytics (optional)
6. 🔔 Configure monitoring (optional)

---

**Congratulations! Your app is live! 🎉**

**Frontend**: https://your-site.netlify.app
**Backend**: https://your-backend.onrender.com
**Cost**: FREE (or $7/mo for always-on backend)

