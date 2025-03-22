#!/bin/bash
set -e
echo "Starting build process for CRM application..."
# Install dependencies
echo "Installing dependencies..."
npm install
# Run linting (optional)
echo "Running linter..."
npm run lint || true
# Build the application
echo "Building the application..."
npm run build
# Create data directory if it doesn't exist
echo "Setting up data directory..."
mkdir -p data
echo "Build completed successfully!"
