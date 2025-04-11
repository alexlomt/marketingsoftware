export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDB, getRow, updateRow } from '@/lib/db';
import { comparePassword } from '@/lib/auth';

/**
 * API route for updating user profile
 * PUT /api/auth/profile
 */
export async function PUT(request) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email } = body;
    
    // Validate required fields
    if (!name && !email) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }
    
    const db = await getDB();
    
    // Get current user data
    const user = await getRow(db, 'SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is already in use by another user
    if (email && email !== user.email) {
      const existingUser = await getRow(db, 'SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        );
      }
    }
    
    // Prepare update data
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      updated_at: new Date().toISOString()
    };
    
    // Update user profile
    await updateRow(
      db,
      'users',
      updateData,
      'id = ?',
      [userId]
    );
    
    // Return updated user data
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: updateData.name,
        email: updateData.email,
        organization_id: user.organization_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
