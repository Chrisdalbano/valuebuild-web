# 🏆 Gold League - League of Legends Item Efficiency Tracker

> **Production-Ready Full-Stack Application**
> 
> Track gold efficiency of all League of Legends items with automated weekly updates from Riot's DDragon API.

---

## ⚡ **Quick Start**

### 📖 **New Here?**
**→ Start with: [`START_HERE.md`](START_HERE.md)** (5 minutes)

### 🚀 **Ready to Deploy?**
**→ Follow: [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md)** (20-30 minutes)

### ✅ **Want a Checklist?**
**→ Use: [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)** (track progress)

---

## 🏗️ **Tech Stack**

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Vue 3       │  HTTPS  │  FastAPI     │  Cloud  │  MongoDB     │
│  + Vite      │────────▶│  + Python    │────────▶│  Atlas       │
│  (Netlify)   │   API   │  (Render)    │  Async  │  (Database)  │
└──────────────┘         └──────────────┘         └──────────────┘
   Frontend                  Backend                  Storage
     FREE                  FREE or $7/mo               FREE
```

**Languages & Frameworks:**
- Frontend: Vue 3, Vite, Chart.js, Axios
- Backend: FastAPI, Python 3.11, Uvicorn
- Database: MongoDB (Motor async driver)
- ETL: APScheduler (weekly cron jobs)

---

## 🎯 **Features**

✅ **Real-time Gold Efficiency** - Calculate value of every item
✅ **Item Comparison** - Compare up to 3 items side-by-side
✅ **Build Optimizer** - Find most efficient item combinations
✅ **Interactive Charts** - Visualize efficiency data
✅ **Quick Insights** - Get instant recommendations
✅ **Auto-Updates** - Weekly data refresh from Riot API
✅ **Responsive Design** - Works on desktop and mobile
✅ **Production Ready** - Deployed and monitored

---

## 📊 **Architecture**

```
USER BROWSER
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
NETLIFY CDN       RENDER SERVICE
(Static Site)     (API Server)
     │                 │
Vue 3 App         FastAPI Backend
     │                 │
     └────────┬────────┘
              │ HTTPS
              ▼
      MONGODB ATLAS
      (Cloud Database)
              │
              ▼
        DDRAGON API
        (Riot Games)
       Weekly ETL Sync
```

---

## 💰 **Cost Breakdown**

| Service | Plan | Features | Cost |
|---------|------|----------|------|
| **MongoDB Atlas** | M0 Free | 512MB storage | $0 |
| **Render** | Free | Spins down after 15 min | $0 |
| **Render** | Starter | Always on, faster | $7/mo |
| **Netlify** | Free | 100GB bandwidth/mo | $0 |
| **Total** | | | **FREE or $7/mo** |

**Recommendation**: Start with **FREE** tier, upgrade Render to Starter ($7/mo) when you get users.

---

## 🚀 **Deployment**

### **Prerequisites**
- GitHub account
- MongoDB Atlas account (free)
- Render account (free)
- Netlify account (free)

### **Quick Deploy (20 minutes)**

1. **MongoDB Atlas** (5 min)
   - Create free M0 cluster
   - Get connection string

2. **Render Backend** (10 min)
   - Connect GitHub repo
   - Set environment variables
   - Deploy

3. **Netlify Frontend** (5 min)
   - Connect GitHub repo
   - Set API URL
   - Deploy

### **Full Guide**
See [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md) for complete step-by-step instructions.

---

## 📚 **Documentation**

### **Essential Reading**
| Document | Purpose | Time |
|----------|---------|------|
| [`📚_READ_ME_FIRST.md`](📚_READ_ME_FIRST.md) | Navigation hub | 2 min |
| [`START_HERE.md`](START_HERE.md) ⭐ | Project overview | 5 min |
| [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md) | Complete deployment | 30 min |
| [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) | Progress tracking | During deploy |
| [`QUICK_COMMANDS.md`](QUICK_COMMANDS.md) | Command reference | 2 min |

### **Additional Docs**
- [`DEPLOYMENT_COMPLETE.md`](DEPLOYMENT_COMPLETE.md) - What's been configured
- [`DEPLOYMENT_FILES_OVERVIEW.md`](DEPLOYMENT_FILES_OVERVIEW.md) - File navigation
- [`_DEPLOYMENT_SUMMARY.md`](_DEPLOYMENT_SUMMARY.md) - Complete summary
- [`README_PRODUCTION.md`](README_PRODUCTION.md) - Full project documentation

---

## 💻 **Local Development**

### **Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
# → http://localhost:8000
```

### **Frontend Setup**
```bash
cd gold-league
npm install
npm run dev
# → http://localhost:5173
```

---

## 🗂️ **Project Structure**

```
gold-league/
├── backend/              # FastAPI backend
│   ├── app.py           # Main API application
│   ├── efficiency.py    # Gold efficiency calculator
│   ├── etl/             # Data pipeline
│   │   └── data_pipeline.py  # Weekly DDragon sync
│   ├── render.yaml      # Render configuration
│   ├── build.sh         # Build script
│   └── start.sh         # Start script
│
├── gold-league/         # Vue 3 frontend
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── api/         # API client
│   │   └── App.vue      # Root component
│   └── package.json
│
├── netlify.toml         # Netlify configuration
├── .github/workflows/   # CI/CD pipeline
└── [docs]/              # 10+ documentation files
```

---

## 🔐 **Environment Variables**

### **Backend (Render)**
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gold_league
ENVIRONMENT=production
CORS_ORIGINS=https://your-site.netlify.app
PYTHON_VERSION=3.11.9
```

### **Frontend (Netlify)**
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_ENVIRONMENT=production
```

---

## 🔧 **API Endpoints**

### **Public Endpoints**
- `GET /` - API info
- `GET /api/health` - Health check
- `GET /api/items` - Get all items with gold efficiency
- `GET /api/items/{id}` - Get specific item
- `GET /api/metadata` - ETL pipeline status
- `POST /api/items/refresh` - Force refresh (background)

### **Example Usage**
```bash
# Get all items
curl https://your-backend.onrender.com/api/items

# Check health
curl https://your-backend.onrender.com/api/health

# Force refresh
curl -X POST https://your-backend.onrender.com/api/items/refresh
```

---

## 🧪 **Data Pipeline**

### **ETL Process**
1. **Extract**: Fetch latest data from Riot's DDragon API
2. **Transform**: Calculate gold efficiency, validate images
3. **Load**: Store in MongoDB with metadata

### **Schedule**
- **Automatic**: Every Monday at 2:00 AM UTC
- **Manual**: Via `/api/items/refresh` endpoint
- **Duration**: ~2-3 minutes for full refresh

### **Data Quality**
✅ Deprecated items filtered
✅ Image validation (no broken images)
✅ Arena items excluded
✅ Only Summoner's Rift items

---

## 📈 **Performance**

- **Backend Response**: < 100ms (cached data)
- **Frontend Load**: < 2s (Netlify CDN)
- **Database Queries**: Indexed, optimized
- **Build Size**: ~500KB gzipped

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Submit pull request

---

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Riot Games** - DDragon API for League data
- **Community Dragon** - Alternative asset CDN
- **League of Legends Wiki** - Gold efficiency formulas

---

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/yourusername/gold-league/issues)
- **Documentation**: See docs in project root
- **Deployment Help**: [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md)

---

## 🎯 **What's Next?**

1. ✅ **Read**: [`START_HERE.md`](START_HERE.md)
2. ✅ **Deploy**: [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md)
3. ✅ **Track**: [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)
4. 🚀 **Launch**: Your app in 20-30 minutes!

---

**Built with ❤️ for the League of Legends community**

🎮 **Good luck on the Rift!** 🏆

---

**Status**: Production Ready ✅  
**Version**: 1.0.0  
**Last Updated**: October 2025

