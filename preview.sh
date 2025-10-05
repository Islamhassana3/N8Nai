#!/bin/bash

# Cross-platform preview launch script for n8n frontend
# Automatically installs dependencies and launches the development server

set -e

echo "🚀 n8n Frontend Preview Launcher"
echo "=================================="

# Navigate to the frontend directory
FRONTEND_DIR="packages/frontend/editor-ui"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first-time setup)..."
    pnpm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🌐 Starting development server..."
echo "   The preview will open automatically at http://localhost:8080"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the development server
# The serve script is configured to run on port 8080, but we'll let it use default
pnpm dev &

DEV_PID=$!

# Wait a moment for the server to start
sleep 3

# Open the browser (cross-platform approach)
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:8080" 2>/dev/null || true
elif command -v open > /dev/null; then
    open "http://localhost:8080" 2>/dev/null || true
else
    echo "💡 Please open http://localhost:8080 in your browser"
fi

# Wait for the dev server process
wait $DEV_PID
