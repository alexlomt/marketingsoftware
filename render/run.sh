#!/bin/bash
set -e

echo "Starting CRM application..."

# Set environment variables if not already set
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}

# Run the application using the standalone server output
echo "Running application on port $PORT..."
node .next/standalone/server.js