#!/bin/bash

echo "🚀 Starting AyurChain MERN Stack Application"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Starting MongoDB..."
    brew services start mongodb/brew/mongodb-community
    sleep 2
fi

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Backend
echo "📦 Starting Backend Server..."
cd backend
npm install --silent
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start Frontend
echo "🎨 Starting Frontend Server..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID