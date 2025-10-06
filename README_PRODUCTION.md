# 🏆 Gold League - Production Deployment

> League of Legends Item Gold Efficiency Tracker - Production Ready

A full-stack web application that tracks and analyzes gold efficiency of League of Legends items with automated weekly updates.

---

## 🎯 Live Demo

- **Frontend**: [Deploy to Netlify](https://app.netlify.com/)
- **Backend API**: [Deploy to Heroku](https://dashboard.heroku.com/)
- **Database**: MongoDB Atlas

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Vue 3 + Vite  │────────▶│  FastAPI + Py   │────────▶│  MongoDB Atlas  │
│    (Netlify)    │  HTTPS  │    (Heroku)     │  Cloud  │   (Database)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Frontend                    Backend API              Persistent Store
                                      │
                                      ▼
                              ┌──────────────┐
                              │ DDragon API  │
                              │ (Riot Games) │
                              └──────────────┘
                                 Weekly ETL
```

---

## 📚 Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Charts**: Chart.js + vue-chartjs
- **HTTP Client**: Axios
- **Hosting**: Netlify
- **CDN**: Netlify Edge Network

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn (ASGI)
- **Database**: MongoDB (Motor - async driver)
- **ETL**: APScheduler (weekly cron jobs)
- **Hosting**: Heroku
- **Python**: 3.11

### Database
- **Development**: MongoDB Local
- **Production**: MongoDB Atlas (M0 Free Tier)
- **Collections**:
  - `items_cache` - Item data with gold efficiency
  - `etl_metadata` - ETL run history and status

### Data Source
- **Riot DDragon API**: League of Legends static data
- **Update Schedule**: Weekly (Mondays 2:00 AM UTC)
- **Patch Version**: Auto-detects latest patch

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local) OR MongoDB Atlas
- Git

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/gold-league.git
cd gold-league
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start MongoDB (if local)
# Windows: net start MongoDB
# Mac: brew services start mongodb-community

# Run backend
python app.py
# API available at http://localhost:8000
```

#### 3. Frontend Setup
```bash
cd ../gold-league

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run frontend
npm run dev
# App available at http://localhost:5173
```

---

## 🌐 Production Deployment

### Complete Guides Available:
- 📖 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full step-by-step deployment
- ⚡ **[PRODUCTION_SETUP_SUMMARY.md](./PRODUCTION_SETUP_SUMMARY.md)** - Quick reference
- 🔧 **[HEROKU_DEPLOY_COMMANDS.md](./HEROKU_DEPLOY_COMMANDS.md)** - Heroku CLI commands

### Quick Deploy (5 Steps)

#### 1. MongoDB Atlas (5 min)
- Create free cluster at https://cloud.mongodb.com/
- Get connection string
- Whitelist IP: `0.0.0.0/0`

#### 2. Heroku Backend (10 min)
```bash
heroku create your-app-name
heroku config:set MONGO_URI="your-mongodb-atlas-uri"
heroku config:set ENVIRONMENT=production
heroku config:set CORS_ORIGINS="https://your-site.netlify.app"
git subtree push --prefix backend heroku main
```

#### 3. Netlify Frontend (5 min)
- Connect GitHub repo to Netlify
- Base directory: `gold-league`
- Build command: `npm run build`
- Publish directory: `gold-league/dist`
- Add env var: `VITE_API_BASE_URL=https://your-backend.herokuapp.com`

#### 4. Update CORS
```bash
heroku config:set CORS_ORIGINS="https://your-actual-site.netlify.app"
```

#### 5. Verify
- Backend: `https://your-backend.herokuapp.com/api/health`
- Frontend: `https://your-site.netlify.app/`

---

## 📂 Project Structure

```
gold-league/
├── backend/                    # FastAPI backend
│   ├── app.py                 # Main FastAPI application
│   ├── efficiency.py          # Gold efficiency calculator
│   ├── riot_client.py         # Riot API client
│   ├── etl/                   # ETL pipeline
│   │   ├── data_pipeline.py   # Weekly DDragon sync
│   │   └── deprecated_items.py # Item filters
│   ├── Procfile               # Heroku process definition
│   ├── runtime.txt            # Python version
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment template
│
├── gold-league/               # Vue 3 frontend
│   ├── src/
│   │   ├── components/        # Vue components
│   │   │   ├── ItemTable.vue
│   │   │   ├── ItemChart.vue
│   │   │   ├── BuildOptimizer.vue
│   │   │   └── QuickInsights.vue
│   │   ├── api/
│   │   │   └── items.js       # API client
│   │   ├── router/
│   │   │   └── index.js       # Vue Router
│   │   └── App.vue            # Root component
│   ├── package.json
│   └── .env.example
│
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
│
├── netlify.toml               # Netlify configuration
├── DEPLOYMENT_GUIDE.md        # Full deployment guide
└── README_PRODUCTION.md       # This file
```

---

## 🔒 Environment Variables

### Backend (Heroku)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gold_league
ENVIRONMENT=production
CORS_ORIGINS=https://your-site.netlify.app
```

### Frontend (Netlify)
```env
VITE_API_BASE_URL=https://your-backend.herokuapp.com
VITE_ENVIRONMENT=production
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
- Runs on push to `main` or `production` branches
- Tests backend and frontend
- Builds frontend
- Reports deployment status

### Auto-Deploy
- **Netlify**: Auto-deploys on push to `production` branch
- **Heroku**: Manual deploy via CLI or GitHub integration

### Branch Strategy
```
main (development)
  ├── Feature branches
  └── Merge & test
      │
production (stable)
      └── Deploy to Heroku + Netlify
```

---

## 📊 Features

### Current Features
✅ **Real-time Gold Efficiency**: Calculate value of every item
✅ **Item Comparison**: Compare up to 3 items side-by-side
✅ **Build Optimizer**: Find most efficient item combinations
✅ **Interactive Charts**: Visualize efficiency across patches
✅ **Quick Insights**: Get instant recommendations
✅ **Auto-Updates**: Weekly data refresh from Riot API
✅ **Responsive Design**: Works on desktop and mobile
✅ **Dark Mode Ready**: Modern, clean UI

### Data Features
✅ **Deprecated Item Filter**: Automatically excludes old items
✅ **Image Validation**: Only shows items with valid images
✅ **Stat Breakdown**: See gold value per stat
✅ **Build Paths**: View item components and builds

---

## 🛠️ Maintenance

### Monitor ETL
```bash
# Check last ETL run
curl https://your-backend.herokuapp.com/api/metadata

# Manual refresh
curl -X POST https://your-backend.herokuapp.com/api/items/refresh
```

### View Logs
```bash
# Backend (Heroku)
heroku logs --tail -a your-app-name

# Frontend (Netlify)
# Dashboard → Deploys → [deploy] → Log
```

### Database Access
- MongoDB Atlas Dashboard → Collections
- Browse `items_cache` and `etl_metadata`

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free Tier | $0 |
| Heroku | Eco Dynos | $5/month |
| Netlify | Free Tier | $0 |
| **Total** | | **$5/month** |

### Free Tier Limits
- **MongoDB Atlas**: 512MB storage (sufficient)
- **Netlify**: 100GB bandwidth, 300 build minutes
- **Heroku Eco**: 1000 dyno hours/month

---

## 🐛 Troubleshooting

### Problem: CORS Errors
**Solution**: Update backend CORS to include frontend URL
```bash
heroku config:set CORS_ORIGINS="https://your-site.netlify.app"
```

### Problem: MongoDB Connection Failed
**Solution**: Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Problem: ETL Not Running
**Solution**: Check logs for errors, verify Riot API is accessible
```bash
heroku logs --tail -a your-app-name
```

### Problem: Build Fails
**Solution**: Clear cache and rebuild
```bash
# Heroku
heroku repo:purge_cache -a your-app-name

# Netlify
# Dashboard → Deploys → Trigger deploy → Clear cache
```

---

## 📈 Performance

### Backend
- **Response Time**: < 100ms (cached data)
- **Database Queries**: Indexed for fast lookups
- **ETL Duration**: ~2-3 minutes for full refresh

### Frontend
- **Build Size**: ~500KB (gzipped)
- **Load Time**: < 2s (Netlify CDN)
- **Lighthouse Score**: 95+ (Performance)

---

## 🔐 Security

✅ Environment variables for secrets
✅ CORS restricted to specific origins
✅ MongoDB authentication enabled
✅ HTTPS everywhere (Netlify + Heroku)
✅ No API keys exposed in frontend
✅ Input validation on backend
✅ MongoDB Atlas network security

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd gold-league
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Submit pull request to `main`

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Riot Games** - DDragon API for League data
- **Community Dragon** - Alternative CDN for assets
- **League of Legends Wiki** - Gold efficiency calculations

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gold-league/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gold-league/discussions)
- **Email**: your-email@example.com

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Basic item efficiency calculation
- [x] Item table with sorting
- [x] ETL pipeline with MongoDB
- [x] Production deployment

### Phase 2: Features 🚧
- [ ] User accounts and favorites
- [ ] Historical patch comparison
- [ ] Champion-specific builds
- [ ] Win rate integration

### Phase 3: Advanced 📋
- [ ] Machine learning recommendations
- [ ] Real-time game analysis
- [ ] Mobile app (React Native)
- [ ] Discord bot integration

---

**Built with ❤️ for the League of Legends community**

🎮 **Good luck on the Rift!** 🏆

