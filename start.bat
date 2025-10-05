@echo off
echo ========================================
echo League Item Efficiency Tracker
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.

REM Start backend in a new window
start "Backend API" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python app.py"

REM Wait a bit for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend in a new window
start "Frontend Dev Server" cmd /k "cd gold-league && npm run dev"

echo.
echo ========================================
echo Servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to stop all servers...
pause > nul

REM Kill both windows when user presses a key
taskkill /FI "WindowTitle eq Backend API*" /F
taskkill /FI "WindowTitle eq Frontend Dev Server*" /F

