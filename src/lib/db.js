// Database configuration for Render deployment
// This file provides PostgreSQL support for Render

import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

let dbPool = null;

/**
 * Initialize the database connection pool
 * @returns {Promise<pg.Pool>} PostgreSQL connection pool
 */
export async function initializeDatabase() {
  if (dbPool) {
    return dbPool;
  }

  // Create a connection pool
  dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test the connection
  try {
    const client = await dbPool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    throw error;
  }

  return dbPool;
}

/**
 * Get database connection pool
 * @returns {Promise<pg.Pool>} PostgreSQL connection pool
 */
export async function getDB() {
  return initializeDatabase();
}

/**
 * Execute a query and get a single row
 * @param {pg.Pool} db - PostgreSQL connection pool
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function getRow(db, query, params = []) {
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
export async function getRows(db, query, params = []) {
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
export async function insertRow(db, table, data) {
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
export async function updateRow(db, table, data, whereClause, whereParams = []) {
  const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = [...Object.values(data)];
  
  // Adjust the parameter indices in the WHERE clause
  let adjustedWhereClause = whereClause;
  for (let i = 0; i < whereParams.length; i++) {
    adjustedWhereClause = adjustedWhereClause.replace(`$${i + 1}`, `$${values.length + i + 1}`);
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
export async function deleteRow(db, table, whereClause, whereParams = []) {
  const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
  const result = await db.query(query, whereParams);
  return result.rows;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return uuidv4();
}

// Export a db object for compatibility with existing code
export const db = {
  query: async (text, params) => {
    const pool = await initializeDatabase();
    return pool.query(text, params);
  },
  end: async () => {
    if (dbPool) {
      await dbPool.end();
      dbPool = null;
    }
  }
};
