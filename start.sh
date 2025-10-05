#!/bin/bash

echo "========================================"
echo "League Item Efficiency Tracker"
echo "========================================"
echo ""
echo "Starting backend and frontend servers..."
echo ""

# Start backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py &
BACKEND_PID=$!

cd ..

# Wait for backend to start
sleep 5

# Start frontend
cd gold-league
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "========================================"
echo "Servers running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

