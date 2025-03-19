// Test for authentication functionality

import { initTestDB, cleanupTestData } from '../lib/test-utils';
import { registerUser, loginUser, getUserById, updateUser } from '../lib/auth';

/**
 * Test authentication functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testAuth(env) {
  console.log('Testing authentication functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Test user registration
    console.log('Testing user registration...');
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    const user = await registerUser(db, userData);
    console.log('User registered successfully:', user);
    
    if (!user.id || user.name !== userData.name || user.email !== userData.email) {
      throw new Error('User registration failed: Invalid user data');
    }
    
    // Test user login
    console.log('Testing user login...');
    const loginResult = await loginUser(db, userData.email, userData.password);
    console.log('User logged in successfully:', loginResult);
    
    if (!loginResult.token || !loginResult.user || loginResult.user.id !== user.id) {
      throw new Error('User login failed: Invalid login result');
    }
    
    // Test get user by ID
    console.log('Testing get user by ID...');
    const retrievedUser = await getUserById(db, user.id);
    console.log('User retrieved successfully:', retrievedUser);
    
    if (retrievedUser.id !== user.id || retrievedUser.name !== userData.name || retrievedUser.email !== userData.email) {
      throw new Error('Get user by ID failed: Invalid user data');
    }
    
    // Test update user
    console.log('Testing update user...');
    const updatedUserData = {
      name: 'Updated Test User'
    };
    
    const updatedUser = await updateUser(db, user.id, updatedUserData);
    console.log('User updated successfully:', updatedUser);
    
    if (updatedUser.name !== updatedUserData.name) {
      throw new Error('Update user failed: Name not updated');
    }
    
    console.log('Authentication tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Authentication tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
