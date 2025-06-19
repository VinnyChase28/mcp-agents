#!/bin/bash

# Simple Web Development Startup Script
# Starts just the web app and API server

set -e

echo "🌍 Starting MCP Agents Web Development..."
echo "========================================"

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    jobs -p | xargs -r kill
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "🔧 Installing dependencies..."
pnpm install

echo "🏗️  Building shared packages..."
pnpm build:packages

echo ""
echo "🚀 Starting servers..."

# Start API server
echo "🔗 API Server starting on http://localhost:${API_PORT:-3001}"
pnpm dev --filter @mcp-agents/api &

# Wait for API to start
sleep 2

# Start Web app  
echo "🌍 Web App starting on http://localhost:${WEB_PORT:-3000}"
pnpm dev --filter @mcp-agents/web &

echo ""
echo "✅ Ready!"
echo "🌍 Open http://localhost:${WEB_PORT:-3000} to start chatting!"
echo ""
echo "Press Ctrl+C to stop"

wait 