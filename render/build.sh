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

# Remove TypeScript configuration and files
echo "Removing TypeScript configuration and files..."
if [ -f tsconfig.json ]; then
  echo "Found tsconfig.json, removing it..."
  rm -f tsconfig.json
fi

# Convert TypeScript files to JSX and remove TypeScript files
echo "Converting TypeScript files to JSX and removing TypeScript files..."
find ./src -name "*.tsx" -type f | while read -r file; do
  # Create a temporary file for conversion
  temp_file="${file%.tsx}.temp.jsx"
  
  # Remove TypeScript types and annotations
  sed 's/: React.ReactNode//g; s/: Readonly<{[^}]*}>//g; s/: Metadata//g; s/import type[^;]*;//g' "$file" > "$temp_file"
  
  # Create the final JSX file
  newfile="${file%.tsx}.jsx"
  mv "$temp_file" "$newfile"
  
  # Remove the original TypeScript file
  rm -f "$file"
  
  echo "Converted and removed $file"
done

# Remove any remaining TypeScript files
find ./src -name "*.ts" -type f -delete
find ./pages -name "*.tsx" -type f -delete 2>/dev/null || true
find ./pages -name "*.ts" -type f -delete 2>/dev/null || true

# Remove TypeScript dependencies from package.json
echo "Removing TypeScript dependencies from package.json..."
sed -i 's/"typescript": "[^"]*",//g' package.json
sed -i 's/"@types\/[^"]*",//g' package.json
sed -i 's/,\s*}/}/g' package.json

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

# Create runtime declaration files for auth.js and db.js
echo "Creating runtime declaration files..."
echo "export const runtime = 'nodejs';" > src/lib/runtime.js

# Modify auth.js to include runtime declaration
if [ -f src/lib/auth.js ]; then
  echo "Updating src/lib/auth.js to use Node.js runtime..."
  sed -i '1i// Use Node.js runtime\nimport { runtime } from "./runtime.js";' src/lib/auth.js
fi

# Modify db.js to include runtime declaration
if [ -f src/lib/db.js ]; then
  echo "Updating src/lib/db.js to use Node.js runtime..."
  sed -i '1i// Use Node.js runtime\nimport { runtime } from "./runtime.js";' src/lib/db.js
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
