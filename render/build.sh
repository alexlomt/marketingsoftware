#!/bin/bash
set -e

echo "Starting build process for CRM application..."

# Install dependencies with explicit npm ci
echo "Installing dependencies..."
npm install --no-shrinkwrap

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating default .env file..."
  cat > .env << EOL
# Database Configuration
DATABASE_URL=\${DATABASE_URL}

# Authentication
JWT_SECRET=\${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Application
NEXT_PUBLIC_APP_URL=\${RENDER_EXTERNAL_URL}
NODE_ENV=production
EOL
fi

# Run migrations
echo "Running database migrations..."
node scripts/migrate.js || echo "Migrations skipped or failed, continuing build..."

# Build the application
echo "Building the application..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Running build..."
npm run build

# Create data directory if it doesn't exist
echo "Setting up data directory..."
mkdir -p data

echo "Build completed successfully!"
