#!/bin/bash
set -e
# Render Build Script

# Install dependencies
npm install

# Install TypeScript dependencies explicitly
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Build the Next.js application
npm run build

# Create data directory for SQLite database
mkdir -p data

echo "Build completed successfully!"
