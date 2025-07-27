#!/bin/bash

# HAi Wallet - Complete System Startup Script
# This script starts all three components: NLP Server, Backend API, and Frontend

set -e  # Exit on any error

echo "🚀 Starting HAi Wallet System..."
echo "=================================="

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    if [ ! -z "$NLP_PID" ]; then
        kill $NLP_PID 2>/dev/null || true
        echo "✅ NLP Server stopped"
    fi
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        echo "✅ Backend API stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "✅ Frontend stopped"
    fi
    echo "🎉 All services stopped successfully"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "NLP" ] || [ ! -d "apps" ]; then
    echo "❌ Error: Please run this script from the HAi Wallet root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected structure: ./NLP, ./apps/api, ./apps/web"
    exit 1
fi

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH"
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "NLP/venv" ]; then
    echo "⚠️  NLP virtual environment not found. Creating..."
    cd NLP
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    cd ..
fi

# Start NLP Server
echo "🤖 Starting NLP Server..."
cd NLP
source venv/bin/activate
python nlp_service.py &
NLP_PID=$!
cd ..
echo "✅ NLP Server started (PID: $NLP_PID)"

# Wait a moment for NLP server to initialize
sleep 3

# Check if NLP server is running
if ! kill -0 $NLP_PID 2>/dev/null; then
    echo "❌ Error: NLP Server failed to start"
    exit 1
fi

# Start Backend API Server
echo "🔧 Starting Backend API Server..."
cd apps/api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

npm run dev &
API_PID=$!
cd ../..
echo "✅ Backend API started (PID: $API_PID)"

# Wait a moment for API server to initialize
sleep 3

# Check if API server is running
if ! kill -0 $API_PID 2>/dev/null; then
    echo "❌ Error: Backend API failed to start"
    cleanup
    exit 1
fi

# Start Frontend Web App
echo "🌐 Starting Frontend Web App..."
cd apps/web

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ../..
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait a moment for frontend to initialize
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Error: Frontend failed to start"
    cleanup
    exit 1
fi

echo ""
echo "🎉 HAi Wallet System Successfully Started!"
echo "=========================================="
echo ""
echo "📱 Frontend Web App: http://localhost:8080"
echo "🔧 Backend API:      http://localhost:3001"
echo "🤖 NLP Service:      http://localhost:8000"
echo ""
echo "🔍 Service Status:"
echo "   NLP Server:    ✅ Running (PID: $NLP_PID)"
echo "   Backend API:   ✅ Running (PID: $API_PID)"
echo "   Frontend:      ✅ Running (PID: $FRONTEND_PID)"
echo ""
echo "💡 Quick Test Commands:"
echo "   • Test NLP:    curl -X POST http://localhost:8000/process_prompt -H 'Content-Type: application/json' -d '{\"prompt\": \"Send 0.1 ETH to Bob\"}'"
echo "   • Test API:    curl http://localhost:3001/api/relay/chains"
echo "   • Open App:    open http://localhost:8080"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait 