#!/bin/bash
set -e

echo "Starting build process for CRM application..."

# Install dependencies with explicit npm ci
echo "Installing dependencies..."
npm ci || npm install

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

# Skip migrations for now until db.js is fixed
echo "Skipping database migrations for now..."

# Build the application
echo "Building the application..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Installing Next.js..."
npm install next@latest react react-dom
echo "Running build..."
npx next build

echo "Build completed successfully!"
