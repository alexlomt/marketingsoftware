import { NextResponse } from 'next/server';
import { createUser } from '@/models/user';
import { createOrganization } from '@/models/organization';

/**
 * API route for user registration
 * POST /api/auth/register
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password, organization_name } = body;
    
    // Validate required fields
    if (!name || !email || !password || !organization_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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
    
    // Create organization first
    const organization = await createOrganization({
      name: organization_name
    });
    
    // Create user with organization ID
    const user = await createUser(
      {
        name,
        email,
        password,
        role: 'admin' // First user is always admin
      },
      organization.id
    );
    
    // Return success response with user data (excluding password)
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization_id: user.organization_id,
        role: user.role
      },
      organization: {
        id: organization.id,
        name: organization.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
