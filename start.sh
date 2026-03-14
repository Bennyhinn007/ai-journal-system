#!/bin/bash
# Quick start script for AI Journal System

echo "🚀 Starting AI Journal System..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from template..."
    cp .env.example .env
    echo "Please edit .env and add your GROQ_API_KEY"
    exit 1
fi

echo "✅ Starting Backend (Port 5000)..."
npm start &
BACKEND_PID=$!
sleep 2

echo "✅ Starting Frontend (Port 3000)..."
cd client
npm start &
FRONTEND_PID=$!
sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 AI Journal System is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:5000"
echo "📚 API Docs:  See README.md"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

wait
