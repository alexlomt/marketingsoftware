#!/bin/bash
set -e
# Render Build Script
# This script is executed by Render during the build phase

# Install dependencies
npm install
# Build the Next.js application
npm run build
# Create data directory for SQLite database
mkdir -p data
echo "Build completed successfully!"
