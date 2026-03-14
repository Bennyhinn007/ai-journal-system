@echo off
REM Quick start script for AI Journal System (Windows)

echo.
echo 🚀 Starting AI Journal System...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo Creating from template...
    copy .env.example .env
    echo Please edit .env and add your GROQ_API_KEY
    pause
    exit /b 1
)

echo ✅ Starting Backend (Port 5000)...
start "AI Journal Backend" npm start
timeout /t 2

echo ✅ Starting Frontend (Port 3000)...
start "AI Journal Frontend" cmd /k "cd client && npm start"
timeout /t 2

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 AI Journal System is running!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📱 Frontend:  http://localhost:3000
echo 🔧 Backend:   http://localhost:5000
echo 📚 API Docs:  See README.md
echo.
echo Close these windows to stop the services
echo.
pause
