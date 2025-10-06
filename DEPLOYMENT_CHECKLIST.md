# ✅ Production Deployment Checklist

Complete this checklist to ensure successful deployment to production.

---

## 📋 Pre-Deployment

### Repository Setup
- [ ] Code is committed to GitHub
- [ ] `.gitignore` includes `.env` files
- [ ] No sensitive data in repository
- [ ] All dependencies listed in `requirements.txt` and `package.json`

### Accounts Created
- [ ] GitHub account (for code hosting)
- [ ] Heroku account (for backend)
- [ ] Netlify account (for frontend)
- [ ] MongoDB Atlas account (for database)

### Tools Installed
- [ ] Git
- [ ] Node.js 18+
- [ ] Python 3.11+
- [ ] Heroku CLI
- [ ] Code editor (VS Code recommended)

---

## 🗄️ MongoDB Atlas Setup

### Cluster Creation
- [ ] Logged into MongoDB Atlas
- [ ] Created free M0 cluster
- [ ] Chose cloud provider and region
- [ ] Named cluster (e.g., `gold-league-prod`)
- [ ] Cluster is fully deployed (takes 5-10 minutes)

### Database Access
- [ ] Created database user
  - Username: `gold_league_admin`
  - Password: Secure password (saved securely)
  - Privileges: `Read and write to any database`

### Network Access
- [ ] Added IP address: `0.0.0.0/0` (Allow access from anywhere)
- [ ] Note: This is safe because authentication is still required

### Connection String
- [ ] Got connection string from Atlas
- [ ] Replaced `<password>` with actual password
- [ ] Added database name: `gold_league`
- [ ] Final format: `mongodb+srv://user:pass@cluster.mongodb.net/gold_league?retryWrites=true&w=majority`
- [ ] Connection string saved securely

**Connection String:**
```
mongodb+srv://gold_league_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gold_league?retryWrites=true&w=majority
```

---

## 🔧 Heroku Backend Setup

### App Creation
- [ ] Heroku CLI installed
- [ ] Logged into Heroku: `heroku login`
- [ ] Created app: `heroku create your-app-name`
- [ ] App name saved: `____________________`
- [ ] App URL saved: `____________________`

### Environment Variables
- [ ] Set `MONGO_URI`:
  ```bash
  heroku config:set MONGO_URI="your-mongodb-connection-string"
  ```
- [ ] Set `ENVIRONMENT`:
  ```bash
  heroku config:set ENVIRONMENT=production
  ```
- [ ] Set `CORS_ORIGINS` (update after Netlify deploy):
  ```bash
  heroku config:set CORS_ORIGINS="http://localhost:5173"
  ```
- [ ] Verified config: `heroku config`

### Deployment Files
- [ ] `backend/Procfile` exists
- [ ] `backend/runtime.txt` exists (Python 3.11.9)
- [ ] `backend/requirements.txt` complete
- [ ] `.env.example` documented

### Deploy Backend
- [ ] From project root, ran:
  ```bash
  git subtree push --prefix backend heroku main
  ```
- [ ] Deployment succeeded (no errors)
- [ ] Dyno is running: `heroku ps`
- [ ] Logs show success: `heroku logs --tail`

### Backend Verification
- [ ] Root endpoint works: `https://your-app.herokuapp.com/`
- [ ] Health check passes: `https://your-app.herokuapp.com/api/health`
- [ ] Items endpoint works: `https://your-app.herokuapp.com/api/items`
- [ ] ETL has run (check logs for "✅ Initial ETL complete")
- [ ] Metadata endpoint shows data: `https://your-app.herokuapp.com/api/metadata`

**Backend URL:** `____________________`

---

## 🌐 Netlify Frontend Setup

### Site Creation
- [ ] Logged into Netlify
- [ ] Clicked "Add new site" → "Import an existing project"
- [ ] Connected to GitHub
- [ ] Selected `gold-league` repository
- [ ] Authorized Netlify to access repository

### Build Configuration
- [ ] Base directory: `gold-league`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `gold-league/dist`
- [ ] Deploy branch: `production` (or `main`)

### Environment Variables
- [ ] Added `VITE_API_BASE_URL`:
  - Key: `VITE_API_BASE_URL`
  - Value: Your Heroku backend URL (e.g., `https://your-app.herokuapp.com`)
- [ ] Added `VITE_ENVIRONMENT`:
  - Key: `VITE_ENVIRONMENT`
  - Value: `production`

### Deploy Frontend
- [ ] Clicked "Deploy site"
- [ ] Build completed successfully
- [ ] No build errors in deploy log
- [ ] Site is live and accessible

### Frontend Verification
- [ ] Site loads: `https://your-site.netlify.app/`
- [ ] No console errors (check browser DevTools)
- [ ] Items are loading and displaying
- [ ] Charts rendering correctly
- [ ] Navigation works
- [ ] All features functional

**Frontend URL:** `____________________`

---

## 🔗 Connect Frontend & Backend

### Update Backend CORS
- [ ] Got Netlify site URL (e.g., `https://gold-league-12345.netlify.app`)
- [ ] Updated Heroku CORS:
  ```bash
  heroku config:set CORS_ORIGINS="https://your-site.netlify.app"
  ```
- [ ] Restarted Heroku app: `heroku restart`
- [ ] Verified CORS by testing frontend → backend calls

### Test Integration
- [ ] Frontend can fetch items from backend
- [ ] No CORS errors in browser console
- [ ] API calls show 200 status in Network tab
- [ ] Data displays correctly in frontend

---

## 🧪 Final Testing

### Functional Tests
- [ ] Item table displays all items
- [ ] Sorting works (by efficiency, cost, name)
- [ ] Filtering works (by tags)
- [ ] Item comparison works (up to 3 items)
- [ ] Build optimizer works
- [ ] Charts render without errors
- [ ] Quick insights display
- [ ] Navigation between views works

### Performance Tests
- [ ] Page loads in < 3 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks (check browser DevTools)
- [ ] Mobile responsive (test on phone/tablet)

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## 📊 Database Verification

### MongoDB Atlas Check
- [ ] Logged into MongoDB Atlas
- [ ] Navigated to Collections
- [ ] `gold_league` database exists
- [ ] `items_cache` collection has documents (100+ items)
- [ ] `etl_metadata` collection has latest run info
- [ ] Data looks correct (no corrupted entries)

---

## 🔐 Security Review

### Environment Variables
- [ ] No secrets in git repository
- [ ] `.env` files in `.gitignore`
- [ ] Production secrets only in Heroku/Netlify config
- [ ] MongoDB connection string secure

### Access Control
- [ ] MongoDB Atlas user has minimal required privileges
- [ ] MongoDB network access properly configured
- [ ] Heroku app not public (or has authentication if needed)
- [ ] CORS restricted to specific origins

### HTTPS
- [ ] Backend uses HTTPS (Heroku provides)
- [ ] Frontend uses HTTPS (Netlify provides)
- [ ] No mixed content warnings

---

## 📈 Monitoring Setup

### Health Checks
- [ ] Backend health endpoint working: `/api/health`
- [ ] Can check ETL status: `/api/metadata`
- [ ] Logs accessible via Heroku CLI

### Alerts (Optional)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure email alerts for downtime
- [ ] Set up log monitoring (Papertrail, etc.)

---

## 📚 Documentation

### Updated Files
- [ ] `DEPLOYMENT_GUIDE.md` reviewed
- [ ] `README_PRODUCTION.md` updated with live URLs
- [ ] Environment variables documented
- [ ] Architecture diagram accurate

### Team Handoff
- [ ] Shared Heroku app access (if team)
- [ ] Shared Netlify site access (if team)
- [ ] Shared MongoDB Atlas access (if team)
- [ ] Documented deployment process

---

## 🎯 Optional Enhancements

### Custom Domain (Optional)
- [ ] Purchased domain name
- [ ] Added custom domain to Netlify
- [ ] Configured DNS records
- [ ] SSL certificate auto-enabled
- [ ] Updated backend CORS with custom domain

### CI/CD (Optional)
- [ ] Heroku auto-deploy from GitHub enabled
- [ ] Netlify auto-deploy configured
- [ ] GitHub Actions workflow tested
- [ ] Branch protection rules set

### Monitoring (Optional)
- [ ] Added Papertrail for logs
- [ ] Set up New Relic APM
- [ ] Configured error tracking (Sentry)
- [ ] Dashboard created for metrics

---

## ✅ Deployment Complete!

### Success Criteria
- [x] Backend deployed and running
- [x] Frontend deployed and accessible
- [x] Database connected and populated
- [x] API calls working between frontend/backend
- [x] ETL pipeline running
- [x] No critical errors in logs
- [x] All features functional

### Live URLs
- **Frontend**: `____________________`
- **Backend API**: `____________________`
- **Health Check**: `____________________/api/health`

### Important Credentials (Store Securely!)
- **MongoDB Atlas**:
  - Username: `____________________`
  - Password: `____________________`
  - Connection String: `____________________`
- **Heroku**:
  - App Name: `____________________`
  - Git Remote: `____________________`
- **Netlify**:
  - Site Name: `____________________`
  - Site ID: `____________________`

---

## 🔄 Post-Deployment

### Monitoring
- [ ] Check logs daily for first week
- [ ] Monitor ETL runs (weekly)
- [ ] Watch error rates
- [ ] Review performance metrics

### Maintenance
- [ ] Schedule weekly health checks
- [ ] Plan for dependency updates
- [ ] Monitor MongoDB usage
- [ ] Review Heroku dyno hours

### Next Steps
- [ ] Share app with users
- [ ] Gather feedback
- [ ] Plan feature additions
- [ ] Set up analytics (Google Analytics, etc.)

---

## 🆘 Troubleshooting

### If Backend Fails
1. Check Heroku logs: `heroku logs --tail`
2. Verify environment variables: `heroku config`
3. Test MongoDB connection
4. Check `Procfile` and `runtime.txt`

### If Frontend Fails
1. Check Netlify deploy log
2. Verify environment variables in Netlify
3. Check browser console for errors
4. Verify API URL is correct

### If CORS Errors
1. Update `CORS_ORIGINS` on Heroku
2. Restart Heroku app
3. Clear browser cache
4. Check Netlify URL matches CORS setting

### If ETL Not Running
1. Check Heroku logs for errors
2. Manually trigger: `POST /api/items/refresh`
3. Check MongoDB Atlas connectivity
4. Verify Riot API is accessible

---

## 📞 Support Resources

- **Heroku Docs**: https://devcenter.heroku.com/
- **Netlify Docs**: https://docs.netlify.com/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Project Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Heroku Commands**: `HEROKU_DEPLOY_COMMANDS.md`

---

**🎉 Congratulations on your production deployment!**

Share your app and enjoy! 🚀

