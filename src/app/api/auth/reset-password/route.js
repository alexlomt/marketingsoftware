import { NextResponse } from 'next/server';
import { getDB, getRow, updateRow } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * API route for resetting password with token
 * POST /api/auth/reset-password
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, password } = body;
    
    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    const db = await getDB();
    
    // Find user with this reset token
    const user = await getRow(
      db,
      'SELECT * FROM users WHERE reset_token = ?',
      [token]
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Check if token is expired
    const tokenExpiry = new Date(user.reset_token_expiry);
    const now = new Date();
    
    if (now > tokenExpiry) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(password);
    
    // Update user password and clear reset token
    await updateRow(
      db,
      'users',
      {
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null,
        updated_at: new Date().toISOString()
      },
      'id = ?',
      [user.id]
    );
    
    return NextResponse.json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    
    // Generic error response
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    );
  }
}
