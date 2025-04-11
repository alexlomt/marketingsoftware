// Database configuration for Render deployment
// This file provides PostgreSQL support for Render
const pg = require('pg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Add this line to indicate Node.js runtime for Next.js when imported in other files
// But keep using CommonJS syntax for compatibility with scripts
if (typeof global !== 'undefined' && global.process && global.process.env) {
  // This will be used by Next.js but ignored by Node.js scripts
  Object.defineProperty(exports, 'runtime', { value: 'nodejs' });
}

const { Pool } = pg;

let dbPool = null;

/**
 * Initialize the database connection pool
 * @returns {Promise<pg.Pool>} PostgreSQL connection pool
 */
async function initializeDatabase() {
  if (dbPool) {
    // console.log('[DB LOG] Returning existing DB pool.'); // Optional: Log reuse
    return dbPool;
  }

  const connectionString = process.env.DATABASE_URL;
  console.log('[DB LOG] Initializing DB pool...');
  if (!connectionString) {
    console.error('[DB ERROR] DATABASE_URL environment variable is not set!');
    throw new Error('DATABASE_URL environment variable is not set!');
  }
  // Mask password for logging
  const maskedConnectionString = connectionString.replace(/:([^:]*)@/, ':********@'); 
  console.log(`[DB LOG] Using connection string (masked): ${maskedConnectionString}`);

  // Create a connection pool
  try {
      dbPool = new Pool({
        connectionString: connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      console.log('[DB LOG] DB Pool created.');
  } catch(error) {
      console.error('[DB ERROR] Failed to CREATE Pool object:', error);
      throw error;
  }

  // Test the connection
  let client;
  try {
    console.log('[DB LOG] Attempting to connect client...');
    client = await dbPool.connect();
    console.log('[DB LOG] Successfully connected client to PostgreSQL database');
  } catch (error) {
    console.error('[DB ERROR] Failed to CONNECT client to PostgreSQL database:', error);
    dbPool = null; // Reset pool if connection fails
    throw error;
  } finally {
     if (client) {
         client.release();
         console.log('[DB LOG] Client released.');
     }
  }

  console.log('[DB LOG] DB Initialization complete.');
  return dbPool;
}

/**
 * Get database connection pool
 * @returns {Promise<pg.Pool>} PostgreSQL connection pool
 */
async function getDB() {
  // console.log('[DB LOG] getDB() called.'); // Optional: Log every call
  return initializeDatabase();
}

// --- Rest of the functions (getRow, getRows, etc.) remain the same ---

/**
 * Execute a query and get a single row
 * @param {pg.Pool} db - PostgreSQL connection pool
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function getRow(db, query, params = []) {
  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Execute a query and get multiple rows
 * @param {pg.Pool} db - PostgreSQL connection pool
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function getRows(db, query, params = []) {
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Insert a row into a table
 * @param {pg.Pool} db - PostgreSQL connection pool
 * @param {string} table - Table name
 * @param {Object} data - Row data
 * @returns {Promise<Object>} Insert result
 */
async function insertRow(db, table, data) {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(data);
  
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
}

/**
 * Update rows in a table
 * @param {pg.Pool} db - PostgreSQL connection pool
 * @param {string} table - Table name
 * @param {Object} data - Update data
 * @param {string} whereClause - WHERE clause (use $n for parameters)
 * @param {Array} whereParams - WHERE parameters
 * @returns {Promise<Object>} Update result
 */
async function updateRow(db, table, data, whereClause, whereParams = []) {
  const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = [...Object.values(data)];
  
  // Adjust the parameter indices in the WHERE clause
  let adjustedWhereClause = whereClause;
  for (let i = 0; i < whereParams.length; i++) {
    // Use a regex to replace placeholder $n ensuring it's not part of a larger number
    const placeholderRegex = new RegExp(`\$${i + 1}(|$)`, 'g');
    adjustedWhereClause = adjustedWhereClause.replace(placeholderRegex, `$${values.length + i + 1}$1`);
  }
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${adjustedWhereClause} RETURNING *`;
  const result = await db.query(query, [...values, ...whereParams]);
  return result.rows;
}

/**
 * Delete rows from a table
 * @param {pg.Pool} db - PostgreSQL connection pool
 * @param {string} table - Table name
 * @param {string} whereClause - WHERE clause (use $n for parameters)
 * @param {Array} whereParams - WHERE parameters
 * @returns {Promise<Object>} Delete result
 */
async function deleteRow(db, table, whereClause, whereParams = []) {
  const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
  const result = await db.query(query, whereParams);
  return result.rows;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return uuidv4();
}

// Export a db object for compatibility with existing code
const db = {
  query: async (text, params) => {
    const pool = await initializeDatabase();
    return pool.query(text, params);
  },
  getDB: initializeDatabase, // Expose initialize directly if needed
  end: async () => {
    if (dbPool) {
      console.log('[DB LOG] Closing DB pool.');
      await dbPool.end();
      dbPool = null;
    }
  }
};

module.exports = {
  db,
  getDB,
  getRow,
  getRows,
  insertRow,
  updateRow,
  deleteRow,
  generateId
};
