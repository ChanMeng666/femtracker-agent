#!/bin/bash
echo "Starting FemTracker Agent..."

echo "Starting backend..."
cd agent
source venv/bin/activate
langgraph dev &
BACKEND_PID=$!

cd ..
echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "Both services are starting..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:2024"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

wait 