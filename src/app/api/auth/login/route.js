export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Added runtime specifier

import { NextResponse } from 'next/server';
import { authenticateUser } from '@/models/user';

/**
 * API route for user login
 * POST /api/auth/login
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const { user, token } = await authenticateUser(email, password);
    
    // Set JWT token in HTTP-only cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization_id: user.organization_id,
        role: user.role
      }
    });
    
    // Set cookie with token
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle invalid credentials
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
