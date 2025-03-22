/**
 * Authentication utility functions
 * Provides helper functions for authentication and authorization
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

/**
 * Get the authenticated user from the request
 * @param {Request} request - Next.js request object
 * @returns {Object|null} User object or null if not authenticated
 */
export function getAuthUser(request) {
  // Get user ID from request headers (set by middleware)
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const organizationId = request.headers.get('x-organization-id');
  
  if (!userId || !userRole || !organizationId) {
    return null;
  }
  
  return {
    id: userId,
    role: userRole,
    organization_id: organizationId
  };
}

/**
 * Check if the user has admin role
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if user is admin, false otherwise
 */
export function isAdmin(request) {
  const userRole = request.headers.get('x-user-role');
  return userRole === 'admin';
}

/**
 * Get the organization ID from the request
 * @param {Request} request - Next.js request object
 * @returns {string|null} Organization ID or null if not authenticated
 */
export function getOrganizationId(request) {
  return request.headers.get('x-organization-id');
}

/**
 * Create an authenticated API route handler
 * @param {Function} handler - Route handler function
 * @param {Object} options - Options
 * @returns {Function} Wrapped handler function
 */
export function withAuth(handler, options = {}) {
  const { adminOnly = false } = options;
  
  return async function(request, ...args) {
    // Get user from request
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin role if required
    if (adminOnly && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Call the original handler with the user
    return handler(request, user, ...args);
  };
}

/**
 * Get the current user from cookies on the client side
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
