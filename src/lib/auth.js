// Node.js-dependent authentication and user management functions

import bcrypt from 'bcryptjs';
import { getEnv } from './env';
import { db, getRow, insertRow, updateRow, generateId } from './db';
import { generateToken as generateJwtToken } from './auth-edge'; // Import the Edge-compatible generator

const env = getEnv();
const SALT_ROUNDS = 10;

/**
 * Hash a password (Requires Node.js Runtime)
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  if (!password) throw new Error('Password cannot be empty');
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash (Requires Node.js Runtime)
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Whether the password matches
 */
export async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
}

// --- User management functions (Require Node.js Runtime) --- 

/**
 * Register a new user
 * @param {object} userData - User data (name, email, password)
 * @returns {Promise<Object>} User object (without token)
 */
export async function registerUser(userData) {
  const { name, email, password } = userData;
  const pool = await db.getDB(); // Use pool directly

  // Check if user already exists
  const existingUser = await getRow(pool, 'SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser) {
    throw new Error('User already exists with this email.');
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
    role: 'user', // Default role
  });

  // Return user without password
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, token: string}>} User object and token
 */
export async function loginUser(email, password) {
  const pool = await db.getDB();

  // Get user
  const user = await getRow(pool, 'SELECT id, name, email, password_hash, role, organization_id FROM users WHERE email = $1', [email]);
  if (!user) {
    console.warn(`Login attempt failed: User not found for email: ${email}`);
    throw new Error('Invalid email or password.');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    console.warn(`Login attempt failed: Invalid password for user: ${email}`);
    throw new Error('Invalid email or password.');
  }

  // Generate token payload
  const tokenPayload = { 
    id: user.id, 
    role: user.role,
    // Include organization_id if it exists
    ...(user.organization_id && { organization_id: user.organization_id })
  };
  
  // Generate token using the Edge-compatible function
  const token = await generateJwtToken(tokenPayload); // Use imported function

  // Return user details and token
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
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
  const user = await getRow(pool, 'SELECT id, name, email, role, organization_id, created_at, updated_at FROM users WHERE id = $1', [id]);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - User data to update (name, email, password, role, organization_id)
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(id, userData) {
  const pool = await db.getDB();
  const { name, email, password, role, organization_id } = userData;

  // Check if user exists
  const existingUser = await getRow(pool, 'SELECT id FROM users WHERE id = $1', [id]);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // Prepare update data
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (organization_id !== undefined) updateData.organization_id = organization_id;
  updateData.updated_at = new Date(); // Ensure updated_at is set

  // Update password if provided
  if (password) {
    updateData.password_hash = await hashPassword(password);
  }

  // Update user
  const updatedUsers = await updateRow(pool, 'users', updateData, { id }); // Use object condition

  if (!updatedUsers || updatedUsers.length === 0) {
      console.error(`User update failed for ID: ${id}`);
      throw new Error('User update failed');
  }

  const updatedUser = updatedUsers[0];

  // Return updated user without password
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    organization_id: updatedUser.organization_id,
  };
}
