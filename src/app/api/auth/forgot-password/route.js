import { NextResponse } from 'next/server';
import { getDB, getRow, updateRow, generateId } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

/**
 * API route for requesting password reset
 * POST /api/auth/forgot-password
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;
    
    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const db = await getDB();
    
    // Check if user exists
    const user = await getRow(db, 'SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      // Don't reveal that the email doesn't exist for security reasons
      return NextResponse.json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour
    
    // Store reset token in database
    await updateRow(
      db,
      'users',
      {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
        updated_at: new Date().toISOString()
      },
      'id = ?',
      [user.id]
    );
    
    // In a real application, send an email with the reset link
    // For this demo, we'll just return the token in the response
    // In production, you would use a service like SendGrid, Mailgun, etc.
    
    return NextResponse.json({
      message: 'If your email is registered, you will receive a password reset link',
      // Only for demo purposes, remove in production
      resetToken,
      resetUrl: `/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    // Generic error response
    return NextResponse.json(
      { error: 'Password reset request failed' },
      { status: 500 }
    );
  }
}
