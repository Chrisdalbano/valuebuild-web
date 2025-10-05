# League Item Efficiency Tracker - Backend

FastAPI backend for calculating League of Legends item gold efficiency.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

Or use uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/items` - Get all items with gold efficiency
- `POST /api/items/refresh` - Force refresh items from Riot API
- `GET /api/items/{item_id}` - Get specific item by ID

## Features

- Fetches live item data from Riot Data Dragon API
- Calculates gold efficiency based on Wiki stat values
- Caches items to avoid rate limiting
- CORS enabled for frontend integration

