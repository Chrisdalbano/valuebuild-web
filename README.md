# BuildValue - League of Legends Gold Efficiency Tracker

A full-stack web application that analyzes gold efficiency for all League of Legends items with automated weekly updates from Riot's DDragon API.

Live: https://buildvalue.chrisdalbano.com/

## Quick Start

**New to the project?** Read [`START_HERE.md`](START_HERE.md)

**Ready to deploy?** Follow [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md)

## Tech Stack

**Frontend:** Vue 3, Vite, Chart.js, Axios (Netlify)  
**Backend:** FastAPI, Python 3.11, Uvicorn (Render)  
**Database:** MongoDB Atlas (Cloud)  
**ETL:** APScheduler (weekly automated sync)

## Features

- Real-time gold efficiency calculations for all items
- Compare up to 6 items side-by-side with detailed breakdowns
- Build optimizer for 6-item builds
- Interactive efficiency charts
- Flash comparisons for quick decisions
- Automated weekly updates from Riot API
- Fully responsive (desktop, tablet, mobile)

## Architecture

```
Frontend (Vue 3) → Backend (FastAPI) → Database (MongoDB Atlas)
    Netlify             Render              Cloud
                                              ↓
                                        DDragon API
                                        (Weekly ETL)
```

## Cost

All services run on free tiers:
- MongoDB Atlas: Free (M0, 512MB)
- Render: Free or $7/mo (Starter for always-on)
- Netlify: Free (100GB bandwidth/month)

## Deployment

1. Create MongoDB Atlas cluster (free M0)
2. Deploy backend to Render (connect GitHub repo)
3. Deploy frontend to Netlify (connect GitHub repo)
4. Set environment variables on both platforms

See [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md) for full instructions.

## Documentation

- [`START_HERE.md`](START_HERE.md) - Project overview
- [`RENDER_DEPLOY_GUIDE.md`](RENDER_DEPLOY_GUIDE.md) - Deployment guide
- [`QUICK_COMMANDS.md`](QUICK_COMMANDS.md) - Command reference
- [`ETL_TRIGGER_GUIDE.md`](ETL_TRIGGER_GUIDE.md) - ETL pipeline details

## Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd gold-league
npm install
npm run dev
```

## Project Structure

```
backend/          # FastAPI backend
  app.py          # Main API
  efficiency.py   # Gold calculations
  etl/            # Data pipeline
gold-league/      # Vue 3 frontend
  src/
    components/   # Vue components
    api/          # API client
```

## Environment Variables

**Backend (Render):**
- `MONGO_URI` - MongoDB connection string
- `ENVIRONMENT` - production
- `CORS_ORIGINS` - Frontend URL

**Frontend (Netlify):**
- `VITE_API_BASE_URL` - Backend URL
- `VITE_ENVIRONMENT` - production

## API Endpoints

- `GET /api/items` - All items with gold efficiency
- `GET /api/items/{id}` - Single item details
- `GET /api/metadata` - ETL status and last update
- `POST /api/items/refresh` - Manual ETL trigger

## ETL Pipeline

- Runs every Monday at 2:00 AM UTC
- Fetches from DDragon API
- Validates images and filters deprecated items
- Updates database with new efficiency calculations

## License

MIT License - see [LICENSE](LICENSE) file

## Disclaimer

BuildValue is not endorsed by Riot Games. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.

