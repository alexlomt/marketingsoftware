#!/bin/bash
set -e

echo "Starting build process for CRM application..."

# Install dependencies using lock file
echo "Installing dependencies..."
npm ci

# Run migrations
echo "Running database migrations..."
# Allow migration script to fail without stopping build (e.g., if db not ready)
# Consider making this more robust or running migrations separately/manually on first deploy
node scripts/migrate.js || echo "Warning: Migrations skipped or failed, continuing build..."

# Build the application
echo "Building the application..."
# Use NODE_OPTIONS for memory limit if needed, but remove --no-warnings
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "Build completed successfully!"
