#!/usr/bin/env bash
# Render Build Script
# This script runs during deployment to set up the backend

set -o errexit  # Exit on error

echo "🔨 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Build complete!"

