# 🚀 Gold League - START HERE

Welcome! This guide will help you understand the project and get started with deployment.

---

## 📖 What is Gold League?

A full-stack web application that:
- Tracks **gold efficiency** of all League of Legends items
- Compares items side-by-side
- Recommends optimal builds
- Updates automatically every week from Riot's API

---

## 🎯 What's Been Set Up For You

Your project is now **100% production-ready** with:

✅ **Backend (FastAPI)** - Ready to deploy to Heroku
✅ **Frontend (Vue 3)** - Ready to deploy to Netlify  
✅ **Database (MongoDB)** - Ready to use Atlas
✅ **ETL Pipeline** - Auto-updates data weekly
✅ **CI/CD** - GitHub Actions configured
✅ **Environment Config** - Dev/prod separation
✅ **Documentation** - Complete deployment guides

---

## 📂 Important Files to Review

### 🎓 Start Here
1. **`START_HERE.md`** (this file) - Overview and quick start
2. **`PRODUCTION_SETUP_SUMMARY.md`** - Quick reference guide
3. **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist

### 📚 Detailed Guides
4. **`DEPLOYMENT_GUIDE.md`** - Complete deployment walkthrough
5. **`HEROKU_DEPLOY_COMMANDS.md`** - All Heroku CLI commands
6. **`README_PRODUCTION.md`** - Full project documentation

### ⚙️ Configuration Files
- `backend/Procfile` - Heroku process definition
- `backend/runtime.txt` - Python version for Heroku
- `netlify.toml` - Netlify build configuration
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `backend/.env.example` - Backend environment template
- `gold-league/.env.example` - Frontend environment template

---

## 🏗️ Tech Stack

```
Frontend:  Vue 3 + Vite + Chart.js
Backend:   FastAPI + Python 3.11
Database:  MongoDB (Atlas)
Hosting:   Netlify (frontend) + Render (backend)
CI/CD:     GitHub Actions
```

---

## ⚡ Quick Deploy (20 minutes)

### 1️⃣ MongoDB Atlas (5 min)
- Sign up: https://cloud.mongodb.com/
- Create free M0 cluster
- Add database user: `gold_league_admin`
- Whitelist IP: `0.0.0.0/0`
- Get connection string

### 2️⃣ Render Backend (10 min)
```bash
# Go to https://render.com/
# Sign up with GitHub
# Click "New +" → "Web Service"
# Connect your repository
# Configure:
#   - Root Directory: backend
#   - Build Command: pip install -r requirements.txt
#   - Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
# Add environment variables:
#   - MONGO_URI: your-mongodb-connection-string
#   - ENVIRONMENT: production
#   - CORS_ORIGINS: http://localhost:5173
# Deploy!
```

### 3️⃣ Netlify Frontend (5 min)
1. Go to https://app.netlify.com/
2. "Add new site" → "Import from GitHub"
3. Select `gold-league` repository
4. Configure:
   - Base directory: `gold-league`
   - Build command: `npm run build`
   - Publish directory: `gold-league/dist`
5. Add environment variable:
   - `VITE_API_BASE_URL` = Your Heroku URL
6. Deploy!

### 4️⃣ Connect Frontend & Backend
```bash
# Update CORS in Render Dashboard
# Environment tab → CORS_ORIGINS → "https://your-site.netlify.app"
# Save changes (Render will auto-redeploy)
```

### ✅ Done!
- Frontend: `https://your-site.netlify.app/`
- Backend: `https://your-backend.onrender.com/`

---

## 🧪 Local Development

### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env

# Run backend
python app.py
# → http://localhost:8000
```

### Frontend
```bash
cd gold-league

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Run frontend
npm run dev
# → http://localhost:5173
```

---

## 📋 Deployment Order

**Important:** Deploy in this order!

1. **MongoDB Atlas** - Database must exist first
2. **Heroku Backend** - Backend needs database connection
3. **Netlify Frontend** - Frontend needs backend URL
4. **Update CORS** - Backend needs frontend URL for CORS

---

## 🎯 Step-by-Step Path

### For Quick Deployment (20 min)
1. Read: `PRODUCTION_SETUP_SUMMARY.md`
2. Follow: Quick Deploy section above
3. Use: `DEPLOYMENT_CHECKLIST.md` to track progress

### For Detailed Deployment (1 hour)
1. Read: `DEPLOYMENT_GUIDE.md` (complete walkthrough)
2. Follow: Step-by-step instructions with explanations
3. Reference: `HEROKU_DEPLOY_COMMANDS.md` for CLI commands
4. Use: `DEPLOYMENT_CHECKLIST.md` to track progress

### For Learning the Codebase
1. Read: `README_PRODUCTION.md` (full documentation)
2. Explore: Project structure and architecture
3. Review: Backend code (`backend/app.py`, `etl/data_pipeline.py`)
4. Review: Frontend code (`gold-league/src/`)

---

## 🔑 Key Concepts

### Environment Variables
Your app uses **environment variables** for configuration:
- **Development**: `.env` files (local only, not committed)
- **Production**: Heroku Config Vars & Netlify Environment Variables

### ETL Pipeline
The app **automatically updates** item data:
- Runs every Monday at 2:00 AM UTC
- Fetches latest data from Riot's DDragon API
- Filters deprecated items
- Validates images
- Stores in MongoDB

### CORS Configuration
Cross-Origin Resource Sharing allows frontend to call backend:
- Must include frontend URL in `CORS_ORIGINS`
- Update after deploying frontend
- Can include multiple URLs (comma-separated)

---

## 💰 Cost

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free | $0 |
| Heroku | Eco Dynos | $5/month |
| Netlify | Free | $0 |
| **Total** | | **$5/month** |

---

## 🆘 Need Help?

### Common Issues

**"Cannot connect to MongoDB"**
→ Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

**"CORS policy error"**
→ Update Heroku `CORS_ORIGINS` with Netlify URL

**"API calls return 404"**
→ Verify `VITE_API_BASE_URL` in Netlify env vars

**"Heroku app crashes"**
→ Check logs: `heroku logs --tail`

### Documentation
- 📖 **Full Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- ⚡ **Quick Reference**: `PRODUCTION_SETUP_SUMMARY.md`
- ✅ **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- 🔧 **Heroku Commands**: `HEROKU_DEPLOY_COMMANDS.md`
- 📚 **Project Docs**: `README_PRODUCTION.md`

### Support Links
- **Heroku**: https://devcenter.heroku.com/
- **Netlify**: https://docs.netlify.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

## 📁 Project Structure

```
gold-league/
├── 📄 START_HERE.md              ← You are here
├── 📄 DEPLOYMENT_GUIDE.md         ← Full deployment guide
├── 📄 DEPLOYMENT_CHECKLIST.md     ← Step-by-step checklist
├── 📄 PRODUCTION_SETUP_SUMMARY.md ← Quick reference
├── 📄 HEROKU_DEPLOY_COMMANDS.md   ← Heroku CLI commands
├── 📄 README_PRODUCTION.md        ← Full documentation
│
├── backend/                       ← FastAPI backend
│   ├── app.py                    ← Main API
│   ├── efficiency.py             ← Gold calculations
│   ├── etl/                      ← Data pipeline
│   ├── Procfile                  ← Heroku config
│   ├── runtime.txt               ← Python version
│   ├── requirements.txt          ← Dependencies
│   └── .env.example              ← Environment template
│
├── gold-league/                   ← Vue 3 frontend
│   ├── src/
│   │   ├── components/           ← Vue components
│   │   ├── api/                  ← API client
│   │   └── App.vue               ← Root component
│   ├── package.json              ← Dependencies
│   └── .env.example              ← Environment template
│
├── netlify.toml                   ← Netlify config
└── .github/workflows/deploy.yml   ← CI/CD pipeline
```

---

## ✅ What You Need to Do

### Prerequisites (one-time setup)
- [ ] Create MongoDB Atlas account
- [ ] Create Heroku account  
- [ ] Create Netlify account
- [ ] Install Heroku CLI
- [ ] Have GitHub repository ready

### Deployment (follow guides)
- [ ] Deploy MongoDB Atlas cluster
- [ ] Deploy backend to Heroku
- [ ] Deploy frontend to Netlify
- [ ] Update CORS configuration
- [ ] Verify everything works

### Maintenance (ongoing)
- [ ] Monitor logs weekly
- [ ] Check ETL runs successfully
- [ ] Review costs monthly
- [ ] Update dependencies as needed

---

## 🎉 Ready to Deploy?

### Recommended Path:
1. ✅ Read this file (you're here!)
2. 📋 Open `DEPLOYMENT_CHECKLIST.md`
3. 📖 Follow `DEPLOYMENT_GUIDE.md` step-by-step
4. 🔧 Reference `HEROKU_DEPLOY_COMMANDS.md` for CLI commands
5. ✅ Check off items in the checklist as you go

---

## 🚀 Let's Get Started!

Choose your path:

**⚡ Fast Track (20 min)**
→ Follow "Quick Deploy" section above

**📚 Detailed Path (1 hour)**
→ Open `DEPLOYMENT_GUIDE.md`

**✅ Checklist Approach**
→ Open `DEPLOYMENT_CHECKLIST.md`

---

**Good luck with your deployment! 🏆**

*Need help? All documentation is in this folder.*

