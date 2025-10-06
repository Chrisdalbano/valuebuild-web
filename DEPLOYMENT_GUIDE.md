# 🚀 Production Deployment Guide

Complete guide to deploy **Gold League** to production using Heroku (backend) and Netlify (frontend).

---

## 📋 Prerequisites

- [x] GitHub account (for CI/CD)
- [x] Heroku account (for backend hosting)
- [x] Netlify account (for frontend hosting)
- [x] MongoDB Atlas account (for production database)

---

## 🗂️ Repository Structure

```
gold-league/
├── backend/              # FastAPI backend
│   ├── app.py
│   ├── requirements.txt
│   ├── Procfile         # Heroku config
│   └── runtime.txt      # Python version
├── gold-league/         # Vue 3 frontend
│   ├── src/
│   └── package.json
├── netlify.toml         # Netlify config
└── .github/workflows/   # CI/CD pipelines
```

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://cloud.mongodb.com/
2. Create a free cluster (M0 Sandbox)
3. Choose a cloud provider and region (closest to Heroku region)
4. Name your cluster (e.g., `gold-league-prod`)

### Step 2: Configure Database Access

1. **Database Access** → **Add New Database User**
   - Username: `gold_league_admin`
   - Password: Generate secure password
   - Privileges: `Read and write to any database`

2. **Network Access** → **Add IP Address**
   - Add `0.0.0.0/0` (allow from anywhere) for Heroku
   - ⚠️ This is safe because you still need credentials

### Step 3: Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string:
   ```
   mongodb+srv://gold_league_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `mongodb+srv://...mongodb.net/gold_league?retryWrites=true&w=majority`

---

## Part 2: Backend Deployment (Heroku)

### Step 1: Install Heroku CLI

```bash
# Windows (with Chocolatey)
choco install heroku-cli

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create app (choose a unique name)
heroku create gold-league-backend

# Or let Heroku generate a name
heroku create
```

### Step 3: Set Environment Variables

```bash
# Set MongoDB connection string
heroku config:set MONGO_URI="mongodb+srv://gold_league_admin:PASSWORD@cluster0.xxxxx.mongodb.net/gold_league?retryWrites=true&w=majority"

# Set environment
heroku config:set ENVIRONMENT=production

# Set CORS origins (update with your Netlify URL)
heroku config:set CORS_ORIGINS="https://gold-league.netlify.app,https://your-custom-domain.com"

# Verify config
heroku config
```

### Step 4: Deploy Backend

#### Option A: Deploy from Git Subtree (Recommended)

```bash
# From project root
git subtree push --prefix backend heroku main
```

#### Option B: Deploy with Heroku Git

```bash
# Add Heroku remote
heroku git:remote -a gold-league-backend

# Deploy backend folder
git subtree push --prefix backend heroku main
```

#### Option C: Manual Deploy

```bash
# From backend folder
cd backend

# Initialize git (if not already)
git init
heroku git:remote -a gold-league-backend

# Commit and push
git add .
git commit -m "Initial backend deployment"
git push heroku main
```

### Step 5: Scale Dynos and Verify

```bash
# Make sure web dyno is running
heroku ps:scale web=1

# Check status
heroku ps

# View logs
heroku logs --tail

# Open app in browser
heroku open
```

### Step 6: Run Initial ETL

The backend will automatically run the ETL pipeline on startup if no data exists. Monitor logs:

```bash
heroku logs --tail
```

You should see:
```
🚀 Starting League Item Efficiency Tracker API
📦 No cached data found. Running initial ETL...
✅ Initial ETL complete! Loaded XXX items.
```

---

## Part 3: Frontend Deployment (Netlify)

### Step 1: Connect Repository to Netlify

1. Go to https://app.netlify.com/
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select your `gold-league` repository

### Step 2: Configure Build Settings

**Build settings:**
- **Base directory**: `gold-league`
- **Build command**: `npm run build`
- **Publish directory**: `gold-league/dist`
- **Branch to deploy**: `production` (or `main`)

### Step 3: Set Environment Variables

In Netlify dashboard:
1. **Site settings** → **Environment variables**
2. Add variables:
   - `VITE_API_BASE_URL` = `https://gold-league-backend.herokuapp.com` (your Heroku URL)
   - `VITE_ENVIRONMENT` = `production`

### Step 4: Deploy

1. Click **Deploy site**
2. Netlify will automatically:
   - Pull code from GitHub
   - Install dependencies (`npm ci`)
   - Build the app (`npm run build`)
   - Deploy to CDN

### Step 5: Configure Custom Domain (Optional)

1. **Domain settings** → **Add custom domain**
2. Add your domain (e.g., `goldleague.com`)
3. Follow DNS configuration instructions
4. Netlify auto-enables HTTPS with Let's Encrypt

### Step 6: Update Backend CORS

After getting your Netlify URL (e.g., `https://gold-league.netlify.app`):

```bash
# Update CORS to include Netlify domain
heroku config:set CORS_ORIGINS="https://gold-league.netlify.app,https://your-custom-domain.com"
```

---

## Part 4: Branch Strategy & CI/CD

### Branch Structure

```
main (development)
  ↓
production (production)
```

### Workflow

1. **Development**:
   ```bash
   git checkout main
   # Make changes
   git commit -m "Add new feature"
   git push origin main
   ```

2. **Deploy to Production**:
   ```bash
   # Merge to production branch
   git checkout production
   git merge main
   git push origin production
   ```

3. **Auto-deployment**:
   - Netlify watches `production` branch
   - Heroku can be configured to auto-deploy from `production`

### Enable Heroku Auto-Deploy (Optional)

1. Heroku Dashboard → **Deploy** tab
2. **Deployment method** → Connect to GitHub
3. Enable **Automatic deploys** from `production` branch
4. Enable **Wait for CI to pass** (uses GitHub Actions)

---

## Part 5: Environment Configuration Files

### Create Local Environment Files

#### Backend `.env` (local development)
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb://localhost:27017
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend `.env` (local development)
```bash
cd gold-league
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

---

## Part 6: Monitoring & Maintenance

### Health Checks

- Backend health: `https://your-backend.herokuapp.com/api/health`
- Frontend: `https://your-site.netlify.app/`

### View Logs

**Backend (Heroku):**
```bash
heroku logs --tail --app gold-league-backend
```

**Frontend (Netlify):**
- Dashboard → **Deploys** → Click on a deploy → **Deploy log**

### Monitor ETL Pipeline

Check ETL status:
```bash
curl https://your-backend.herokuapp.com/api/metadata
```

Manual ETL refresh:
```bash
curl -X POST https://your-backend.herokuapp.com/api/items/refresh
```

### Database Maintenance

View data in MongoDB Atlas:
1. Atlas Dashboard → **Collections**
2. Browse `gold_league` database
3. View `items_cache` and `etl_metadata` collections

---

## Part 7: Cost Breakdown

### Free Tier Limits

✅ **MongoDB Atlas (Free M0)**:
- 512 MB storage
- Shared RAM
- Shared vCPU
- Perfect for this project

✅ **Heroku (Free Dynos - Deprecated)**:
- Note: Heroku discontinued free tier in Nov 2022
- **Eco Dynos**: $5/month per dyno
- **Basic**: $7/month per dyno

✅ **Netlify (Free Tier)**:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Auto HTTPS
- Perfect for frontend

### Recommended Setup

**Option 1: Minimal Cost**
- Backend: Heroku Eco ($5/month)
- Frontend: Netlify Free
- Database: MongoDB Atlas Free
- **Total: $5/month**

**Option 2: Better Performance**
- Backend: Heroku Basic ($7/month)
- Frontend: Netlify Free
- Database: MongoDB Atlas M10 ($10/month for dedicated cluster)
- **Total: $17/month**

---

## Part 8: Troubleshooting

### Backend Issues

**Problem: Backend not starting**
```bash
heroku logs --tail
```
Common fixes:
- Check `Procfile` exists
- Verify `requirements.txt` is complete
- Ensure MongoDB connection string is correct

**Problem: MongoDB connection timeout**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Test connection locally first

**Problem: ETL fails**
```bash
heroku run python -c "from etl.data_pipeline import run_etl_now; import asyncio; asyncio.run(run_etl_now())"
```

### Frontend Issues

**Problem: API calls fail (CORS)**
- Update backend CORS_ORIGINS with Netlify URL
- Check browser console for exact error
- Verify Netlify environment variables are set

**Problem: Build fails on Netlify**
- Check build logs in Netlify dashboard
- Verify `package.json` scripts
- Check if `VITE_API_BASE_URL` is set

### Common Fixes

**Clear Heroku build cache:**
```bash
heroku plugins:install heroku-repo
heroku repo:purge_cache -a gold-league-backend
git commit --allow-empty -m "Rebuild"
git push heroku main
```

**Restart Heroku app:**
```bash
heroku restart
```

**Rebuild Netlify site:**
- Dashboard → **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## Part 9: Quick Commands Reference

### Development
```bash
# Start backend
cd backend
python app.py

# Start frontend
cd gold-league
npm run dev
```

### Deployment
```bash
# Deploy backend to Heroku
git subtree push --prefix backend heroku production

# Netlify auto-deploys on push to production branch
git push origin production
```

### Monitoring
```bash
# Backend logs
heroku logs --tail

# Check health
curl https://your-backend.herokuapp.com/api/health

# ETL metadata
curl https://your-backend.herokuapp.com/api/metadata
```

---

## Part 10: Security Checklist

- [x] MongoDB credentials stored as environment variables
- [x] CORS restricted to specific origins
- [x] MongoDB Atlas network access configured
- [x] HTTPS enabled (Netlify auto-enables)
- [x] No sensitive data in git repository
- [x] `.env` files in `.gitignore`
- [x] Rate limiting (can add if needed)

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Backend is running: `https://your-backend.herokuapp.com/`
- [ ] Frontend is accessible: `https://your-site.netlify.app/`
- [ ] API calls work (check Network tab in browser)
- [ ] ETL has run successfully (check `/api/metadata`)
- [ ] Items are loading in frontend
- [ ] MongoDB Atlas has data in `items_cache` collection
- [ ] Logs show no errors
- [ ] Health check passes: `/api/health`

---

## 📞 Support Resources

- **Heroku Docs**: https://devcenter.heroku.com/
- **Netlify Docs**: https://docs.netlify.com/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

## 🔄 Updating the App

### Backend Updates
```bash
# Make changes
cd backend
git add .
git commit -m "Update backend"

# Deploy to Heroku
git subtree push --prefix backend heroku production
```

### Frontend Updates
```bash
# Make changes
cd gold-league
git add .
git commit -m "Update frontend"

# Push to production branch (Netlify auto-deploys)
git push origin production
```

### Database Schema Changes
```bash
# Connect to MongoDB Atlas
# Use Compass or Atlas UI to modify collections
# Or run migration scripts via Heroku CLI
heroku run python your_migration_script.py
```

---

**Happy Deploying! 🚀**

