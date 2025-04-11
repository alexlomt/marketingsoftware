/**
 * User model
 * Represents a user in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';
// Import Node.js dependent functions from auth.js
import { hashPassword, comparePassword } from '../lib/auth'; 
// Import Edge-compatible generateToken from auth-edge.js
import { generateToken } from '../lib/auth-edge'; 

/**
 * Create a new user
 * @param {Object} data - User data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created user (without password)
 */
export async function createUser(data, organizationId) {
  const db = await getDB();
  const { name, email, password, role } = data;
  
  // Check if user already exists
  const existingUser = await getRow(db, 'SELECT * FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Generate user ID
  const id = generateId();
  
  // Insert user
  await insertRow(db, 'users', {
    id,
    organization_id: organizationId,
    name,
    email,
    password_hash: passwordHash,
    role: role || 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return user without password
  const user = await getRow(
    db, 
    'SELECT id, organization_id, name, email, role, created_at, updated_at FROM users WHERE id = ?', 
    [id]
  );
  
  return user;
}

/**
 * Authenticate user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object and token
 */
export async function authenticateUser(email, password) {
  const db = await getDB();
  
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
  
  // Generate token (now async)
  const token = await generateToken({ // Added await
    id: user.id,
    organization_id: user.organization_id,
    role: user.role
  });
  
  // Return user without password
  return {
    user: {
      id: user.id,
      organization_id: user.organization_id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    },
    token
  };
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object (without password)
 */
export async function getUserById(id) {
  const db = await getDB();
  
  const user = await getRow(
    db, 
    'SELECT id, organization_id, name, email, role, created_at, updated_at FROM users WHERE id = ?', 
    [id]
  );
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

/**
 * Get users by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of user objects (without passwords)
 */
export async function getUsersByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { limit = 50, offset = 0 } = options;
  
  return getRows(
    db, 
    'SELECT id, organization_id, name, email, role, created_at, updated_at FROM users WHERE organization_id = ? ORDER BY name LIMIT ? OFFSET ?', 
    [organizationId, limit, offset]
  );
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} data - User data to update
 * @returns {Promise<Object>} Updated user (without password)
 */
export async function updateUser(id, data) {
  const db = await getDB();
  
  // Check if user exists
  const user = await getRow(db, 'SELECT * FROM users WHERE id = ?', [id]);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : user.name,
    email: data.email !== undefined ? data.email : user.email,
    role: data.role !== undefined ? data.role : user.role,
    updated_at: new Date().toISOString()
  };
  
  // Update password if provided
  if (data.password) {
    updateData.password_hash = await hashPassword(data.password);
  }
  
  // Update user
  await updateRow(db, 'users', updateData, 'id = ?', [id]);
  
  // Return updated user without password
  return getUserById(id);
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const db = await getDB();
  
  // Check if user exists
  await getUserById(id);
  
  // Delete user
  await deleteRow(db, 'users', 'id = ?', [id]);
}
