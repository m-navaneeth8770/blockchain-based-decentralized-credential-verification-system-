#!/bin/bash

echo "🚀 Starting Academic Credential Verification System..."
echo ""

# Start Hardhat Node
echo "📦 Starting Hardhat Node..."
npx hardhat node &
HARDHAT_PID=$!
sleep 5

# Deploy Contract
echo "📝 Deploying Smart Contract..."
npx hardhat run scripts/deploy.js --network localhost

# Start Backend Services
echo "🔧 Starting Backend Services..."
cd backend
npm start &
BACKEND_PID=$!
node certificate-verifier-ai.js &
VERIFIER_PID=$!
cd ..

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "📋 Service URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Email Service: http://localhost:3001"
echo "   - Certificate Verifier: http://localhost:3002"
echo "   - Hardhat Node: http://localhost:8545"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $HARDHAT_PID $BACKEND_PID $VERIFIER_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
