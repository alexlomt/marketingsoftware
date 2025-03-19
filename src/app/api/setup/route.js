// API setup endpoint for creating initial admin user
// Simplified version that doesn't require database connection

import { NextResponse } from 'next/server';

// Environment variables with fallbacks
const getEnv = () => ({
  SETUP_KEY: process.env.SETUP_KEY || 'render-setup-key'
});

export async function POST(request) {
  try {
    const { SETUP_KEY } = getEnv();
    
    // Parse request body
    const body = await request.json();
    const { name, email, password, setupKey } = body;
    
    // Validate setup key
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      );
    }
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, just return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Setup completed successfully',
        user: { id: '123', name, email }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during setup' },
      { status: 500 }
    );
  }
}
