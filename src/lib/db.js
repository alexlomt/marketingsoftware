// Database configuration for Render deployment
// This file replaces the Cloudflare D1 configuration with SQLite for Render

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

let dbInstance = null;

/**
 * Initialize the database
 * @returns {Promise<sqlite.Database>} SQLite database instance
 */
export async function initializeDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Open the database
  dbInstance = await open({
    filename: path.join(dataDir, 'gohighlevel.db'),
    driver: sqlite3.Database
  });

  // Apply migrations if needed
  await applyMigrations(dbInstance);

  return dbInstance;
}

/**
 * Apply database migrations
 * @param {sqlite.Database} db - SQLite database instance
 * @returns {Promise<void>}
 */
async function applyMigrations(db) {
  // Check if migrations have been applied
  const tableExists = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  ).catch(() => null);

  if (tableExists) {
    return; // Migrations already applied
  }

  console.log('Applying database migrations...');
  
  // Read and execute the migration SQL
  const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Split the SQL into individual statements
  const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
  
  // Execute each statement
  for (const statement of statements) {
    if (statement.trim()) {
      await db.exec(statement);
    }
  }
  
  console.log('Database migrations applied successfully');
}

/**
 * Get database instance
 * @returns {Promise<sqlite.Database>} SQLite database instance
 */
export async function getDB() {
  return initializeDatabase();
}

/**
 * Execute a query and get a single row
 * @param {sqlite.Database} db - SQLite database instance
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function getRow(db, query, params = []) {
  return db.get(query, params);
}

/**
 * Execute a query and get multiple rows
 * @param {sqlite.Database} db - SQLite database instance
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function getRows(db, query, params = []) {
  return db.all(query, params);
}

/**
 * Insert a row into a table
 * @param {sqlite.Database} db - SQLite database instance
 * @param {string} table - Table name
 * @param {Object} data - Row data
 * @returns {Promise<Object>} Insert result
 */
export async function insertRow(db, table, data) {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  return db.run(query, values);
}

/**
 * Update rows in a table
 * @param {sqlite.Database} db - SQLite database instance
 * @param {string} table - Table name
 * @param {Object} data - Update data
 * @param {string} whereClause - WHERE clause
 * @param {Array} whereParams - WHERE parameters
 * @returns {Promise<Object>} Update result
 */
export async function updateRow(db, table, data, whereClause, whereParams = []) {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), ...whereParams];
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  return db.run(query, values);
}

/**
 * Delete rows from a table
 * @param {sqlite.Database} db - SQLite database instance
 * @param {string} table - Table name
 * @param {string} whereClause - WHERE clause
 * @param {Array} whereParams - WHERE parameters
 * @returns {Promise<Object>} Delete result
 */
export async function deleteRow(db, table, whereClause, whereParams = []) {
  const query = `DELETE FROM ${table} WHERE ${whereClause}`;
  return db.run(query, whereParams);
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return uuidv4();
}
