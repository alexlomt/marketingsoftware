#!/bin/bash
set -e

echo "Starting CRM application..."

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run migrate:production
fi

# Create admin user if needed
if [ "$CREATE_ADMIN" = "true" ]; then
  echo "Creating admin user..."
  npm run create-admin
fi

# Start the application
echo "Starting the application server..."
npm start
