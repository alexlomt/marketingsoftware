#!/bin/bash
set -e

echo "Starting build process for CRM application..."

# Install dependencies using lock file
echo "Installing dependencies..."
npm ci

# Run migrations
echo "Running database migrations..."
# Ensure migrations must succeed for the build to continue
node scripts/migrate.js

# Build the application
echo "Building the application..."
# Use NODE_OPTIONS for memory limit if needed, but remove --no-warnings
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "Build completed successfully!"
