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

# Remove TypeScript configuration
echo "Removing TypeScript configuration..."
if [ -f tsconfig.json ]; then
  echo "Found tsconfig.json, removing it..."
  rm -f tsconfig.json
fi

# Create proper layout.jsx file
echo "Creating proper layout.jsx file..."
cat > src/app/layout.jsx << EOL
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'GoHighLevel Clone',
  description: 'A comprehensive marketing and CRM platform similar to GoHighLevel'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={\`\${inter.variable} antialiased\`}>{children}</body>
    </html>
  )
}
EOL

# Create proper page.jsx file
echo "Creating proper page.jsx file..."
cat > src/app/page.jsx << EOL
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({
    count: 0,
    recentAccess: []
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Marketing Software CRM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
            <p className="mb-2">Total Clients: {stats.count}</p>
            <p className="mb-4">Recent Activity: {stats.recentAccess.length} logins</p>
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-400">
              Go to Dashboard →
            </Link>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/clients" className="text-blue-500 hover:text-blue-400">
                  Manage Clients
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-blue-500 hover:text-blue-400">
                  Marketing Campaigns
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="text-blue-500 hover:text-blue-400">
                  Schedule Appointments
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
EOL

# Create appointments layout
echo "Creating appointments layout..."
mkdir -p src/app/appointments
cat > src/app/appointments/layout.jsx << EOL
export default function AppointmentsLayout({ children }) {
  return (
    <div className="appointments-container">
      <div className="appointments-content">
        {children}
      </div>
    </div>
  );
}
EOL

# Fix auth.js to use Node.js runtime without import
echo "Fixing auth.js to use Node.js runtime..."
if [ -f src/lib/auth.js ]; then
  # Remove any existing runtime import or declaration
  sed -i '/import.*runtime/d' src/lib/auth.js
  sed -i '/export const runtime/d' src/lib/auth.js
  
  # Add runtime declaration at the top
  sed -i '1i// Use Node.js runtime\nexport const runtime = "nodejs";' src/lib/auth.js
fi

# Fix db.js to use Node.js runtime without import
echo "Fixing db.js to use Node.js runtime..."
if [ -f src/lib/db.js ]; then
  # Remove any existing runtime import
  sed -i '/import.*runtime/d' src/lib/db.js
  
  # Add runtime declaration as a property
  sed -i '/const pg = require/i// Add runtime property for Next.js\nObject.defineProperty(exports, "runtime", { value: "nodejs" });' src/lib/db.js
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
