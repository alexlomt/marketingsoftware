export const runtime = "nodejs";

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getEnv } from './env';
import { db, getRow, insertRow, updateRow, generateId } from './db';

const env = getEnv();
const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Whether the password matches
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {string} [expiresIn='7d'] - Token expiration time
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Register a new user
 * @param {object} userData - User data (name, email, password)
 * @returns {Promise<Object>} User object
 */
export async function registerUser(userData) {
  const { name, email, password } = userData;
  const pool = await db.getDB(); // Use pool directly

  // Check if user already exists
  const existingUser = await getRow(pool, 'SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate user ID
  const id = generateId();

  // Insert user
  const newUser = await insertRow(pool, 'users', {
    id,
    name,
    email,
    password_hash: passwordHash,
    // created_at and updated_at should have defaults in the DB schema
  });

  // Return user without password
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object and token
 */
export async function loginUser(email, password) {
  const pool = await db.getDB();

  // Get user
  const user = await getRow(pool, 'SELECT * FROM users WHERE email = $1', [email]);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken({ id: user.id }, env.JWT_EXPIRES_IN || '7d');

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
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 */
export async function getUserById(id) {
  const pool = await db.getDB();
  const user = await getRow(pool, 'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1', [id]);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - User data to update (name, email, password)
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(id, userData) {
  const pool = await db.getDB();
  const { name, email, password } = userData;

  // Check if user exists
  const existingUser = await getRow(pool, 'SELECT * FROM users WHERE id = $1', [id]);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // Prepare update data
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  updateData.updated_at = new Date(); // Ensure updated_at is set

  // Update password if provided
  if (password) {
    updateData.password_hash = await hashPassword(password);
  }

  // Update user
  const updatedUsers = await updateRow(pool, 'users', updateData, 'id = $1', [id]);

  if (!updatedUsers || updatedUsers.length === 0) {
      throw new Error('User update failed');
  }

  const updatedUser = updatedUsers[0];

  // Return updated user without password
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
  };
}
