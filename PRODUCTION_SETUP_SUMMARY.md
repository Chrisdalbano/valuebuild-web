# 🚀 Production Deployment - Quick Reference

## Stack Overview

### Backend (FastAPI)
- **Framework**: FastAPI + Uvicorn
- **Database**: MongoDB (Atlas for production)
- **Hosting**: Heroku
- **Port**: Dynamic (Heroku assigns via `$PORT`)
- **Language**: Python 3.11

### Frontend (Vue 3)
- **Framework**: Vue 3 + Vite
- **Hosting**: Netlify
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)

### Database
- **Development**: MongoDB local (localhost:27017)
- **Production**: MongoDB Atlas (cloud)

---

## 📂 New Files Created

```
✅ backend/Procfile                  # Heroku process definition
✅ backend/runtime.txt               # Python version for Heroku
✅ backend/.env.example              # Backend environment template
✅ gold-league/.env.example          # Frontend environment template
✅ netlify.toml                      # Netlify build & deploy config
✅ .github/workflows/deploy.yml      # GitHub Actions CI/CD
✅ .gitignore                        # Updated with env files
✅ DEPLOYMENT_GUIDE.md               # Complete deployment instructions
```

---

## 🔧 Modified Files

### backend/app.py
- ✅ Added `dotenv` support for environment variables
- ✅ Dynamic CORS origins from `CORS_ORIGINS` env var
- ✅ Environment indicator in root endpoint
- ✅ Production-ready configuration

### gold-league/src/api/items.js
- ✅ Dynamic API URL from `VITE_API_BASE_URL`
- ✅ Falls back to localhost for development
- ✅ Works with both dev and prod environments

---

## 🎯 Quick Start Guide

### 1. MongoDB Atlas Setup (5 minutes)
1. Create account at https://cloud.mongodb.com/
2. Create free M0 cluster
3. Add database user with read/write permissions
4. Whitelist IP: `0.0.0.0/0` (allows Heroku)
5. Get connection string:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/gold_league?retryWrites=true&w=majority
   ```

### 2. Heroku Backend Deployment (10 minutes)

```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI="your-mongodb-atlas-connection-string"
heroku config:set ENVIRONMENT=production
heroku config:set CORS_ORIGINS="https://your-site.netlify.app"

# Deploy (from project root)
git subtree push --prefix backend heroku main

# Verify
heroku logs --tail
heroku open
```

### 3. Netlify Frontend Deployment (5 minutes)

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub repository
4. Configure:
   - **Base directory**: `gold-league`
   - **Build command**: `npm run build`
   - **Publish directory**: `gold-league/dist`
5. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend.herokuapp.com`
6. Deploy!

### 4. Update Backend CORS

After getting your Netlify URL:
```bash
heroku config:set CORS_ORIGINS="https://your-site.netlify.app"
```

---

## 🔑 Environment Variables

### Backend (Heroku)
```bash
MONGO_URI=mongodb+srv://...
ENVIRONMENT=production
CORS_ORIGINS=https://your-site.netlify.app
```

### Frontend (Netlify)
```bash
VITE_API_BASE_URL=https://your-backend.herokuapp.com
VITE_ENVIRONMENT=production
```

---

## 🌿 Branch Strategy

### Option 1: Single Branch (Simple)
```bash
main → Deploy both Heroku & Netlify from main
```

### Option 2: Dev/Prod Branches (Recommended)
```bash
main (development) → Netlify preview deploys
  ↓
production → Auto-deploy to Heroku & Netlify
```

**Workflow:**
```bash
# Development
git checkout main
# ... make changes ...
git commit -m "Add feature"
git push origin main

# Deploy to production
git checkout production
git merge main
git push origin production  # Triggers deployments
```

---

## 📊 Cost Analysis

| Service | Free Tier | Cost |
|---------|-----------|------|
| **MongoDB Atlas** | 512MB M0 Cluster | FREE |
| **Heroku** | Eco Dynos | $5/month |
| **Netlify** | 100GB bandwidth | FREE |
| **Total** | | **$5/month** |

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Connection string obtained
- [ ] Heroku account created
- [ ] Netlify account created
- [ ] GitHub repository pushed

### Backend Deployment
- [ ] Heroku app created
- [ ] Environment variables set on Heroku
- [ ] Backend deployed to Heroku
- [ ] Heroku dyno is running (`heroku ps`)
- [ ] Backend health check passes: `/api/health`
- [ ] ETL has run successfully (check logs)

### Frontend Deployment
- [ ] Netlify site created
- [ ] Environment variables set on Netlify
- [ ] Build successful
- [ ] Site is accessible
- [ ] API calls working (check browser console)

### Final Verification
- [ ] Backend CORS includes Netlify URL
- [ ] Items loading in frontend
- [ ] MongoDB Atlas has data in `items_cache`
- [ ] No console errors in browser
- [ ] All features working

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to MongoDB"
**Fix:** Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Issue: "CORS policy error"
**Fix:** Update Heroku `CORS_ORIGINS` with Netlify URL:
```bash
heroku config:set CORS_ORIGINS="https://your-site.netlify.app"
```

### Issue: "API calls return 404"
**Fix:** Verify `VITE_API_BASE_URL` in Netlify environment variables

### Issue: "Heroku app crashes"
**Fix:** Check logs and verify `Procfile` and `runtime.txt` exist:
```bash
heroku logs --tail
```

### Issue: "Build fails on Netlify"
**Fix:** Check build logs, verify `package.json` in correct directory

---

## 🔄 Updating the App

### Backend Updates
```bash
# Make changes in backend/
git add backend/
git commit -m "Update backend"
git subtree push --prefix backend heroku main
```

### Frontend Updates
```bash
# Make changes in gold-league/
git add gold-league/
git commit -m "Update frontend"
git push origin production  # Netlify auto-deploys
```

### Manual ETL Refresh
```bash
curl -X POST https://your-backend.herokuapp.com/api/items/refresh
```

---

## 📱 Monitoring

### Health Checks
- Backend: `https://your-backend.herokuapp.com/api/health`
- Frontend: `https://your-site.netlify.app/`
- ETL Status: `https://your-backend.herokuapp.com/api/metadata`

### Logs
```bash
# Backend logs (Heroku)
heroku logs --tail

# Frontend logs
# Netlify Dashboard → Deploys → [specific deploy] → Deploy log
```

---

## 🎉 Success!

Your app is now production-ready with:
- ✅ Scalable backend on Heroku
- ✅ Fast frontend on Netlify CDN
- ✅ Persistent database on MongoDB Atlas
- ✅ Automatic weekly data updates (ETL)
- ✅ HTTPS enabled everywhere
- ✅ Environment-based configuration
- ✅ CI/CD ready (GitHub Actions)

**Next Steps:**
1. Follow `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Set up custom domain (optional)
3. Configure monitoring/alerts
4. Add tests to CI/CD pipeline
5. Set up staging environment (optional)

---

**Need Help?**
- Full guide: `DEPLOYMENT_GUIDE.md`
- Backend config: `backend/.env.example`
- Frontend config: `gold-league/.env.example`
- CI/CD: `.github/workflows/deploy.yml`

