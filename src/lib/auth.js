// Authentication utilities

import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { getRow, insertRow, updateRow } from './db';

// Add this line to indicate Node.js runtime for Next.js
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Whether the password matches
 */
export async function comparePassword(password, hashedPassword) {
  return compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = '7d') {
  return sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Register a new user
 * @param {D1Database} db - D1 database client
 * @param {Object} userData - User data
 * @returns {Promise<Object>} User object
 */
export async function registerUser(db, userData) {
  const { name, email, password } = userData;
  
  // Check if user already exists
  const existingUser = await getRow(db, 'SELECT * FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Generate user ID
  const id = crypto.randomUUID();
  
  // Insert user
  await insertRow(db, 'users', {
    id,
    name,
    email,
    password_hash: passwordHash,
  });
  
  // Return user without password
  return {
    id,
    name,
    email,
  };
}

/**
 * Login a user
 * @param {D1Database} db - D1 database client
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object and token
 */
export async function loginUser(db, email, password) {
  // Get user
  const user = await getRow(db, 'SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate token
  const token = generateToken({ id: user.id });
  
  // Return user without password
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

/**
 * Get user by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 */
export async function getUserById(db, id) {
  const user = await getRow(db, 'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [id]);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

/**
 * Update user
 * @param {D1Database} db - D1 database client
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(db, id, userData) {
  const { name, email, password } = userData;
  
  // Check if user exists
  const existingUser = await getRow(db, 'SELECT * FROM users WHERE id = ?', [id]);
  if (!existingUser) {
    throw new Error('User not found');
  }
  
  // Prepare update data
  const updateData = {
    name: name || existingUser.name,
    email: email || existingUser.email,
    updated_at: new Date().toISOString(),
  };
  
  // Update password if provided
  if (password) {
    updateData.password_hash = await hashPassword(password);
  }
  
  // Update user
  await updateRow(db, 'users', updateData, 'id = ?', [id]);
  
  // Return updated user without password
  return {
    id,
    name: updateData.name,
    email: updateData.email,
  };
}
