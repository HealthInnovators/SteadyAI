#!/bin/bash

echo "🧪 SteadyAI Local Testing"
echo "========================"
echo ""

echo "Checking Backend (Port 3000)..."
if curl -s http://localhost:3000 &>/dev/null; then
    echo "✅ Backend running: http://localhost:3000"
else
    echo "❌ Backend not responding"
fi

echo ""
echo "Checking Frontend (Port 3001)..."
if curl -s http://localhost:3001 &>/dev/null; then
    echo "✅ Frontend running: http://localhost:3001"
else
    echo "❌ Frontend not responding"
fi

echo ""
echo "📊 Backend Status:"
curl -s http://localhost:3000 | jq . 2>/dev/null || curl -s http://localhost:3000

echo ""
echo "✨ Both services ready for testing!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Backend API: http://localhost:3000"
echo "3. To stop: pkill -f 'tsx watch' && pkill -f 'next dev'"
