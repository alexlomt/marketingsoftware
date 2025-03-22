import { NextResponse } from 'next/server';

/**
 * API route for user logout
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      message: 'Logout successful'
    });
    
    // Clear auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Generic error response
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
