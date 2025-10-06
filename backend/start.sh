#!/usr/bin/env bash
# Render Start Script
# This script starts the FastAPI application

set -o errexit  # Exit on error

echo "🚀 Starting FastAPI application..."
echo "📊 Environment: $ENVIRONMENT"
echo "🌐 Port: $PORT"

# Start Uvicorn server
uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}

