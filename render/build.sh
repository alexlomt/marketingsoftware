#!/bin/bash
set -e

echo "Starting build process for CRM application..."

# Fix Babel conflict with Next.js fonts
echo "Checking for Babel configuration conflicts..."
if [ -f .babelrc ]; then
  echo "Found .babelrc file, removing to use Next.js SWC compiler..."
  rm -f .babelrc
fi

# Install dependencies with --no-shrinkwrap to ignore package-lock.json
echo "Installing dependencies..."
npm install --no-shrinkwrap

# Install TypeScript packages explicitly with exact versions
echo "Installing TypeScript packages..."
npm install --save-dev typescript@5.3.3 @types/react@18.2.45 @types/node@20.10.5

# Verify TypeScript installation
echo "Verifying TypeScript installation..."
if [ -f ./node_modules/.bin/tsc ]; then
  echo "TypeScript successfully installed"
  ./node_modules/.bin/tsc --version
else
  echo "TypeScript installation failed, installing again..."
  npm install --no-save typescript@5.3.3
  ./node_modules/.bin/tsc --version
fi

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
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Create data directory if it doesn't exist
echo "Setting up data directory..."
mkdir -p data

echo "Build completed successfully!"
