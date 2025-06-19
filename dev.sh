#!/bin/bash

# MCP Agents Development Startup Script
# This script starts all development services concurrently

set -e

echo "🚀 Starting MCP Agents Development Environment..."
echo "=================================================="

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found, using default configuration"
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo ""
echo "🔧 Installing dependencies..."
pnpm install

echo ""
echo "🏗️  Building packages..."
pnpm build:packages

echo ""
echo "🌐 Starting development servers..."
echo "================================="

# Start API server
echo "🔗 Starting API Server on http://localhost:${API_PORT:-3001}"
pnpm dev --filter @mcp-agents/api &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start Web app
echo "🌍 Starting Web App on http://localhost:${WEB_PORT:-3000}"
pnpm dev --filter @mcp-agents/web &
WEB_PID=$!

# Wait a moment for Web to start
sleep 2

# Start MCP Servers (optional - only if you want to test them)
echo "🤖 Starting MCP Servers..."
echo "   Calculator MCP Server"
pnpm dev --filter calculator-mcp &
CALC_PID=$!

echo "   File Manager MCP Server"
pnpm dev --filter file-manager-mcp &
FILE_PID=$!

echo "   API Client MCP Server"
pnpm dev --filter api-client-mcp &
CLIENT_PID=$!

echo ""
echo "✅ All services started successfully!"
echo "=================================="
echo "🌍 Web App:     http://localhost:${WEB_PORT:-3000}"
echo "🔗 API Server:  http://localhost:${API_PORT:-3001}"
echo "🤖 MCP Servers: Running in background"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================="

# Wait for all background processes
wait 