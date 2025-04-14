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
  console.log('[DB LOG] Initializing DB pool (Attempt)...'); // Log attempt
  if (!connectionString) {
    console.error('[DB ERROR] FATAL: DATABASE_URL environment variable is not set!');
    // Force exit if critical env var is missing
    process.exit(1);
    // throw new Error('DATABASE_URL environment variable is not set!'); // Original throw
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
      console.log('[DB LOG] DB Pool object created successfully.'); // Log pool creation success
  } catch(error) {
      console.error('[DB ERROR] FATAL: Failed to CREATE Pool object:', error);
      // Force exit if pool cannot even be created
       process.exit(1);
      // throw error; // Original throw
  }

  // Test the connection
  let client;
  try {
    console.log('[DB LOG] Attempting to connect client for initial test...'); // Log connection attempt
    client = await dbPool.connect();
    console.log('[DB LOG] Successfully connected client to PostgreSQL database (Initial Test)'); // Log success
  } catch (error) {
    console.error('[DB ERROR] FATAL: Failed initial test CONNECT client to PostgreSQL database:', error); // Log failure
    dbPool = null; // Reset pool if connection fails
     // Force exit if initial connection fails
     process.exit(1);
    // throw error; // Original throw
  } finally {
     if (client) {
         client.release();
         console.log('[DB LOG] Initial test client released.'); // Log release
     }
  }

  console.log('[DB LOG] DB Initialization complete and test connection successful.'); // Log overall success
  return dbPool;
}

/**
 * Get database connection pool
 * @returns {Promise<pg.Pool>} PostgreSQL connection pool
 */
async function getDB() {
  // console.log('[DB LOG] getDB() called.'); // Optional: Log every call
  // InitializeDatabase already handles logging and potential exit
  return initializeDatabase();
}

// --- Enhanced Logging for Query Execution ---

/**
 * Centralized query execution with enhanced logging
 * @param {string} operationName - Name of the operation (e.g., 'getRow', 'insertRow')
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<pg.QueryResult>} Query result
 */
async function executeQuery(operationName, query, params = []) {
    const pool = await getDB(); // Ensures pool is initialized
    const startTime = Date.now();
    console.log(`[DB EXEC LOG] Starting operation: ${operationName}`);
    // console.log(`[DB EXEC LOG] Query: ${query}`); // Optional: Log full query (can be verbose)
    // console.log(`[DB EXEC LOG] Params: ${JSON.stringify(params)}`); // Optional: Log params

    try {
        const result = await pool.query(query, params);
        const duration = Date.now() - startTime;
        console.log(`[DB EXEC LOG] Succeeded operation: ${operationName} (${duration}ms)`);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[DB EXEC ERROR] FAILED operation: ${operationName} (${duration}ms)`);
        console.error(`[DB EXEC ERROR] Query: ${query}`); // Log query on error
        console.error(`[DB EXEC ERROR] Params: ${JSON.stringify(params)}`); // Log params on error
        console.error(`[DB EXEC ERROR] Error:`, error); // Log the full error
        // Re-throw the error so the calling function knows it failed
        throw error;
    }
}


/**
 * Execute a query and get a single row
 * @param {pg.Pool} db - PostgreSQL connection pool (kept for compatibility, but getDB() is used internally)
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function getRow(db, query, params = []) {
  // db parameter is ignored, using centralized executeQuery
  const result = await executeQuery('getRow', query, params);
  return result.rows[0];
}

/**
 * Execute a query and get multiple rows
 * @param {pg.Pool} db - PostgreSQL connection pool (ignored)
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function getRows(db, query, params = []) {
  // db parameter is ignored, using centralized executeQuery
  const result = await executeQuery('getRows', query, params);
  return result.rows;
}

/**
 * Insert a row into a table
 * @param {pg.Pool} db - PostgreSQL connection pool (ignored)
 * @param {string} table - Table name
 * @param {Object} data - Row data
 * @returns {Promise<Object>} Insert result
 */
async function insertRow(db, table, data) {
  // db parameter is ignored, using centralized executeQuery
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(data);

  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await executeQuery('insertRow', query, values);
  return result.rows[0];
}

/**
 * Update rows in a table
 * @param {pg.Pool} db - PostgreSQL connection pool (ignored)
 * @param {string} table - Table name
 * @param {Object} data - Update data
 * @param {string|Object} whereClause - WHERE clause (use $n for parameters) or object for simple key-value match
 * @param {Array} whereParams - WHERE parameters (used only if whereClause is a string)
 * @returns {Promise<Object[]>} Update result (array of updated rows)
 */
async function updateRow(db, table, data, whereClause, whereParams = []) {
 // db parameter is ignored, using centralized executeQuery
  const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = [...Object.values(data)];

  // Adjust the parameter indices in the WHERE clause
  let adjustedWhereClause;
   // Check if whereClause is an object (simple key-value match)
  if (typeof whereClause === 'object' && whereClause !== null && !Array.isArray(whereClause)) {
      const whereKeys = Object.keys(whereClause);
      // Build clause like 'key1 = $N AND key2 = $N+1 ...'
      adjustedWhereClause = whereKeys.map((key, index) => `${key} = $${values.length + index + 1}`).join(' AND ');
      whereParams = Object.values(whereClause); // Use the values from the object

  } else if (typeof whereClause === 'string'){
      // Original logic for string whereClause
      adjustedWhereClause = whereClause;
      for (let i = 0; i < whereParams.length; i++) {
          const placeholderRegex = new RegExp(`\$${i + 1}(?!\d)`, 'g'); // Match $N not followed by a digit
          adjustedWhereClause = adjustedWhereClause.replace(placeholderRegex, `$${values.length + i + 1}`);
      }
  } else {
      throw new Error('Invalid whereClause type in updateRow');
  }

  const query = `UPDATE ${table} SET ${setClause} WHERE ${adjustedWhereClause} RETURNING *`;
  const result = await executeQuery('updateRow', query, [...values, ...whereParams]);
  return result.rows;
}


/**
 * Delete rows from a table
 * @param {pg.Pool} db - PostgreSQL connection pool (ignored)
 * @param {string} table - Table name
 * @param {string} whereClause - WHERE clause (use $n for parameters)
 * @param {Array} whereParams - WHERE parameters
 * @returns {Promise<Object>} Delete result
 */
async function deleteRow(db, table, whereClause, whereParams = []) {
  // db parameter is ignored, using centralized executeQuery
  const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
  const result = await executeQuery('deleteRow', query, whereParams);
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
    // Use the centralized executeQuery for direct db.query calls too
    return executeQuery('directQuery', text, params);
  },
  getDB: initializeDatabase, // Expose initialize directly if needed
  end: async () => {
    if (dbPool) {
      console.log('[DB LOG] Attempting to close DB pool...'); // Log closing attempt
      try {
         await dbPool.end();
         console.log('[DB LOG] DB pool closed successfully.'); // Log success
         dbPool = null;
      } catch (error) {
         console.error('[DB ERROR] Error closing DB pool:', error); // Log error on close
      }
    } else {
         console.log('[DB LOG] No active DB pool to close.');
    }
  }
};

module.exports = {
  db,
  getDB, // Keep exporting getDB for direct use if needed
  getRow,
  getRows,
  insertRow,
  updateRow,
  deleteRow,
  generateId
};
