import { NextResponse } from 'next/server';
import { getDB, getRow, updateRow } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/auth';

/**
 * API route for changing user password
 * POST /api/auth/change-password
 */
export async function POST(request) {
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
    const { currentPassword, newPassword } = body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    const db = await getDB();
    
    // Get user with password hash
    const user = await getRow(db, 'SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    // Update user password
    await updateRow(
      db,
      'users',
      {
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      },
      'id = ?',
      [userId]
    );
    
    return NextResponse.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
