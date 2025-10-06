# ⚡ Quick Commands Reference

Essential commands for deploying and managing Gold League with **Render** + **Netlify**.

---

## 🚀 Initial Deployment

### 1. MongoDB Atlas (Web UI)
```
https://cloud.mongodb.com/
→ Create free M0 cluster
→ Add database user
→ Whitelist IP: 0.0.0.0/0
→ Copy connection string
```

### 2. Render Backend (Web UI)
```
https://render.com/
→ Sign up with GitHub
→ New + → Web Service
→ Connect repository: gold-league
→ Root Directory: backend
→ Build Command: pip install -r requirements.txt
→ Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
→ Environment Variables:
   MONGO_URI=mongodb+srv://...
   ENVIRONMENT=production
   CORS_ORIGINS=http://localhost:5173
→ Deploy
```

### 3. Netlify Frontend (Web UI)
```
https://app.netlify.com/
→ Import from GitHub
→ Base: gold-league
→ Build: npm run build
→ Publish: gold-league/dist
→ Add env: VITE_API_BASE_URL=https://your-backend.onrender.com
→ Deploy
```

### 4. Update CORS
```
Render Dashboard → Your Service → Environment
→ Update CORS_ORIGINS → https://your-site.netlify.app
→ Save Changes (auto-redeploys)
```

---

## 🔧 Common Tasks

### View Render Logs
```
Render Dashboard → Your Service → Logs
```

### Restart Render Service
```
Render Dashboard → Your Service → Manual Deploy → Clear cache & deploy
```

### Update Render Environment Variables
```
Render Dashboard → Your Service → Environment → Edit → Save
```

### Trigger Netlify Rebuild
```
Netlify Dashboard → Your Site → Deploys → Trigger deploy → Clear cache
```

---

## 🧪 API Testing

### Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

### Get Items
```bash
curl https://your-backend.onrender.com/api/items
```

### Get ETL Metadata
```bash
curl https://your-backend.onrender.com/api/metadata
```

### Force ETL Refresh
```bash
curl -X POST https://your-backend.onrender.com/api/items/refresh
```

---

## 💻 Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd gold-league
npm install
npm run dev
```

---

## 🔄 Update & Redeploy

### Backend Update
```bash
# Make changes in backend/
git add backend/
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Frontend Update
```bash
# Make changes in gold-league/
git add gold-league/
git commit -m "Update frontend"
git push origin main
# Netlify auto-deploys
```

---

## 📊 Monitoring

### Check Backend Status
- Render Dashboard → Logs
- Or: `curl https://your-backend.onrender.com/api/health`

### Check Frontend Status
- Netlify Dashboard → Deploys
- Or: Visit `https://your-site.netlify.app/`

### Monitor ETL
```bash
curl https://your-backend.onrender.com/api/metadata
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```
1. Check Render logs
2. Verify MONGO_URI is set
3. Check requirements.txt is complete
```

### CORS Errors
```
1. Update CORS_ORIGINS in Render environment
2. Use exact Netlify URL (no trailing slash)
3. Save and wait for redeploy
```

### MongoDB Connection Failed
```
1. Check Atlas IP whitelist: 0.0.0.0/0
2. Verify connection string format
3. Check user permissions
```

### Items Not Loading
```
1. Check VITE_API_BASE_URL in Netlify
2. Verify backend health endpoint
3. Check ETL status: /api/metadata
4. Trigger manual ETL: POST /api/items/refresh
```

---

## 📞 Quick Links

- **Render Dashboard**: https://dashboard.render.com/
- **Netlify Dashboard**: https://app.netlify.com/
- **MongoDB Atlas**: https://cloud.mongodb.com/

---

## 💡 Pro Tips

### Keep Render Free Tier Awake
Use UptimeRobot to ping your backend every 5 minutes:
```
Monitor URL: https://your-backend.onrender.com/api/health
Interval: 5 minutes
```

### Quick Health Check
```bash
# Check everything at once
curl -s https://your-backend.onrender.com/api/health | jq
```

### Watch for Changes
```bash
# Monitor ETL runs
watch -n 30 'curl -s https://your-backend.onrender.com/api/metadata | jq'
```

---

**For detailed guides, see:**
- Full deployment: `RENDER_DEPLOY_GUIDE.md`
- Quick start: `START_HERE.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`
