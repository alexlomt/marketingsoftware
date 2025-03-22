#!/bin/bash

# Database migration script for production environment

echo "Running database migrations..."

# Create data directory if it doesn't exist
mkdir -p data

# Set environment variables based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
  echo "Running in production mode"
  # Use PostgreSQL in production
  node -e "
    const { Pool } = require('pg');
    const fs = require('fs');
    const path = require('path');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    async function runMigrations() {
      try {
        // Create migrations table if it doesn't exist
        await pool.query(\`
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        \`);
        
        // Get list of applied migrations
        const { rows } = await pool.query('SELECT name FROM migrations');
        const appliedMigrations = rows.map(row => row.name);
        
        // Get list of migration files
        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
          .filter(file => file.endsWith('.sql'))
          .sort();
        
        // Apply migrations that haven't been applied yet
        for (const file of migrationFiles) {
          if (!appliedMigrations.includes(file)) {
            console.log(\`Applying migration: \${file}\`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await pool.query(sql);
            await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            console.log(\`Migration applied: \${file}\`);
          }
        }
        
        console.log('All migrations applied successfully');
      } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
      } finally {
        await pool.end();
      }
    }
    
    runMigrations();
  "
else
  echo "Running in development mode"
  # Use SQLite in development
  node -e "
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const fs = require('fs');
    const path = require('path');
    
    async function runMigrations() {
      try {
        // Create data directory if it doesn't exist
        if (!fs.existsSync('./data')) {
          fs.mkdirSync('./data');
        }
        
        // Open database connection
        const db = await open({
          filename: './data/crm.db',
          driver: sqlite3.Database
        });
        
        // Create migrations table if it doesn't exist
        await db.exec(\`
          CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        \`);
        
        // Get list of applied migrations
        const appliedMigrations = await db.all('SELECT name FROM migrations');
        const appliedMigrationNames = appliedMigrations.map(row => row.name);
        
        // Get list of migration files
        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
          .filter(file => file.endsWith('.sql'))
          .sort();
        
        // Apply migrations that haven't been applied yet
        for (const file of migrationFiles) {
          if (!appliedMigrationNames.includes(file)) {
            console.log(\`Applying migration: \${file}\`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await db.exec(sql);
            await db.run('INSERT INTO migrations (name) VALUES (?)', [file]);
            console.log(\`Migration applied: \${file}\`);
          }
        }
        
        console.log('All migrations applied successfully');
        await db.close();
      } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
      }
    }
    
    runMigrations();
  "
fi

echo "Database migration completed"
