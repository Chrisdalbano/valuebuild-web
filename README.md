# ⚔️ League Item Efficiency Tracker

A comprehensive web application for analyzing League of Legends item gold efficiency. Built with Vue 3, FastAPI, Chart.js, and powered by Riot's Data Dragon API.

![Tech Stack](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Chart.js](https://img.shields.io/badge/Chart.js-Latest-FF6384?logo=chart.js)

## 🎯 Features

### ✅ Core Features
- **Real-time Item Data**: Fetches live item data from Riot's Data Dragon API
- **Gold Efficiency Calculator**: Automatic calculation based on reference stat values
- **Advanced Search & Sort**: Filter by name, efficiency rating, and cost range
- **Item Comparison**: Side-by-side comparison of any 2 items with detailed stat breakdown
- **Interactive Charts**: 
  - Distribution analysis
  - Top & Bottom performers
  - Cost vs Efficiency scatter plot
  - Category-based trends
- **Responsive Design**: Beautiful, modern UI that works on all devices

### 🧮 Gold Efficiency Formula

```
Gold Efficiency = (Gold Value / Item Price) × 100%
```

Where **Gold Value** is calculated from base stat values:
- Attack Damage: 35g per point
- Ability Power: 20g per point
- Armor: 20g per point
- Magic Resist: 20g per point
- Health: 2.67g per point
- And more...

## 🏗️ Project Structure

```
gold-league/
├── backend/                   # FastAPI backend
│   ├── app.py                # Main FastAPI application
│   ├── riot_client.py        # Riot API client
│   ├── efficiency.py         # Gold efficiency calculator
│   ├── requirements.txt      # Python dependencies
│   └── README.md            # Backend documentation
├── gold-league/              # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemTable.vue      # Main item table
│   │   │   ├── ItemCompare.vue    # Comparison view
│   │   │   └── ItemChart.vue      # Analytics charts
│   │   ├── api/
│   │   │   └── items.js           # API client
│   │   ├── App.vue                # Main app component
│   │   ├── main.js                # Vue entry point
│   │   └── style.css              # Global styles
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment** (recommended):
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Start the backend server**:
```bash
python app.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd gold-league
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📊 API Endpoints

### `GET /api/items`
Fetch all items with calculated gold efficiency

**Response:**
```json
{
  "items": [
    {
      "id": "1001",
      "name": "Boots",
      "cost": 300,
      "goldEfficiency": 100.0,
      "totalGoldValue": 300.0,
      "statBreakdown": {...}
    }
  ]
}
```

### `POST /api/items/refresh`
Force refresh items from Riot API

### `GET /api/items/{item_id}`
Get specific item details

## 🎨 UI Features

### Item Table
- **Search**: Real-time search by item name
- **Filters**: 
  - Efficiency rating (Excellent, Good, Fair, Poor)
  - Cost range (min/max gold)
- **Sorting**: Click column headers to sort
- **Pagination**: Adjustable items per page
- **Selection**: Select up to 2 items for comparison

### Item Comparison
- Side-by-side stat comparison
- Detailed stat breakdown with gold values
- Efficiency difference calculation
- Smart recommendations

### Analytics Charts
- **Distribution**: Shows how items are distributed across efficiency ranges
- **Top & Bottom 10**: Highlights best and worst performing items
- **Cost vs Efficiency**: Scatter plot revealing cost/value relationships
- **By Category**: Trend analysis across cost categories

## 🧠 Why This Matters

Gold efficiency is crucial for:
- **Theorycrafting**: Understanding which items give the most stats per gold
- **Build Optimization**: Making informed decisions on item purchases
- **Early Game Planning**: Identifying cost-efficient components
- **Champion Synergy**: Finding items that maximize specific stat profiles

### Important Note
Gold efficiency measures **stat value only**. It doesn't account for:
- Unique passive abilities
- Active effects
- Champion synergies
- Situational power spikes

Use this tool as a starting point for analysis, not absolute truth!

## 🛠️ Tech Stack

### Frontend
- **Vue 3**: Modern reactive framework with Composition API
- **Chart.js**: Interactive, responsive charts
- **Axios**: HTTP client for API requests
- **Vite**: Lightning-fast build tool

### Backend
- **FastAPI**: High-performance Python web framework
- **Uvicorn**: ASGI server
- **Requests**: HTTP library for Riot API calls

### Data Source
- **Riot Data Dragon**: Official League of Legends static data API
- **Wiki Reference**: Gold efficiency values from [LoL Wiki](https://leagueoflegends.fandom.com/wiki/Gold_efficiency)

## 📈 Future Enhancements

Potential features for future versions:
- [ ] Champion-specific item recommendations
- [ ] Build path optimization
- [ ] Historical efficiency tracking across patches
- [ ] MongoDB integration for persistent caching
- [ ] User accounts and saved builds
- [ ] Advanced filtering (mythic vs legendary, item categories)
- [ ] Export/share comparisons
- [ ] Mobile app version

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## ⚖️ License

This project is for educational purposes. League of Legends and all related properties are trademarks of Riot Games.

**Not endorsed by Riot Games**

## 🙏 Acknowledgments

- Riot Games for the Data Dragon API
- League of Legends Wiki for gold efficiency formulas
- The LoL theorycrafting community

## 📞 Support

If you encounter issues:
1. Ensure both backend and frontend servers are running
2. Check that the backend is accessible at `http://localhost:8000`
3. Verify Python and Node.js versions meet requirements
4. Check console for error messages

---

Built with ❤️ for the League of Legends community

