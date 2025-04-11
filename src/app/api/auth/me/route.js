export const dynamic = 'force-dynamic'; // Add this to mark as dynamic route

import { NextResponse } from 'next/server';
// Import verifyToken from the Edge-compatible file
import { verifyToken } from '@/lib/auth-edge'; 
// Import getUserById from the model, which relies on Node.js DB access
import { getUserById } from '@/models/user'; 

/**
 * API route for getting current user information
 * GET /api/auth/me
 */
export async function GET(request) {
  try {
    // Get auth token from cookie
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token (now async)
    const payload = await verifyToken(authToken); // Added await
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await getUserById(payload.id);
    
    // Return user data (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization_id: user.organization_id,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    
    // Handle user not found
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}
