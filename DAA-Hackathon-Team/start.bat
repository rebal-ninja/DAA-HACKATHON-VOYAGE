@echo off
echo ==========================================================
echo Starting VoyageAI - Intelligent Route Optimization (DAA)
echo ==========================================================
echo.

echo Starting FastAPI Backend on port 8000...
start "VoyageAI Backend" /D "%~dp0backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Starting Vite React Frontend on port 5173...
start "VoyageAI Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo Application launched!
echo Frontend: http://127.0.0.1:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ==========================================================
