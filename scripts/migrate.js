/**
 * Migration runner script
 * Executes database migrations in sequence
 */

const path = require('path');
const fs = require('fs');
const { db } = require('../src/lib/db');

// Get migration files
const migrationsDir = path.join(__dirname, '../models/migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.js'))
  .sort(); // Sort to ensure migrations run in order

async function runMigrations() {
  console.log('Starting migrations...');
  
  try {
    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get already executed migrations
    const result = await db.query('SELECT name FROM migrations');
    const executedMigrations = result.rows.map(row => row.name);
    
    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        const migration = require(path.join(migrationsDir, file));
        await migration.up(db);
        
        // Record migration as executed
        await db.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        
        console.log(`Migration ${file} completed successfully`);
      } else {
        console.log(`Migration ${file} already executed, skipping`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.end();
  }
}

// Run migrations
runMigrations();
