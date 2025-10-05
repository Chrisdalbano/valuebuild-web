# 🚀 Quick Start Guide

## Fastest Way to Run the App

### Windows Users

1. **Double-click** `start.bat` - This will:
   - Set up Python virtual environment
   - Install backend dependencies
   - Start the FastAPI backend on port 8000
   - Start the Vue frontend on port 5173
   - Open both in separate terminal windows

2. **Open your browser** to `http://localhost:5173`

3. **Press any key** in the main terminal to stop all servers

### macOS/Linux Users

1. **Make the script executable**:
```bash
chmod +x start.sh
```

2. **Run the script**:
```bash
./start.sh
```

3. **Open your browser** to `http://localhost:5173`

4. **Press Ctrl+C** to stop all servers

## Manual Setup (If scripts don't work)

### Terminal 1 - Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Backend will run on `http://localhost:8000`

### Terminal 2 - Frontend

```bash
cd gold-league
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## First Time Using?

1. Wait for the backend to fetch items from Riot API (may take 10-20 seconds)
2. The frontend will display "Loading items from Riot API..."
3. Once loaded, you'll see the item table with all League items
4. Start exploring!

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Check if port 8000 is available
- Install dependencies manually: `pip install -r backend/requirements.txt`

### Frontend won't start
- Ensure Node.js 16+ is installed: `node --version`
- Check if port 5173 is available
- Install dependencies manually: `npm install` in `gold-league/` directory

### Can't fetch items
- Check your internet connection
- Riot API may be temporarily down
- Try clicking "Refresh Data" button in the app

### Browser shows connection error
- Ensure both backend AND frontend are running
- Check console for CORS errors
- Try accessing backend directly: `http://localhost:8000/api/items`

## What's Next?

Explore these features:
- 📋 **Item Table**: Search, filter, and sort League items
- ⚖️ **Compare**: Select 2 items to see detailed comparison
- 📊 **Analytics**: View beautiful charts and statistics
- ℹ️ **About**: Learn how gold efficiency is calculated

## Need Help?

Check the full README.md for detailed documentation and feature explanations.

Enjoy theorycrafting! ⚔️

