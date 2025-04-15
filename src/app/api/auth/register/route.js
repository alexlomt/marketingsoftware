// src/app/api/auth/register/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createUser } from '@/models/user';
import { createOrganization } from '@/models/organization';

/**
 * API route for user registration
 * POST /api/auth/register
 */
export async function POST(request) {
  console.log('[REGISTER API LOG] Received registration request.'); // Log start
  let step = 'parsing_body'; // Track execution step

  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password, organization_name } = body;
    console.log('[REGISTER API LOG] Body parsed:', { name, email, organization_name }); // Log parsed data (exclude password)
    step = 'validating_fields';

    // Validate required fields
    if (!name || !email || !password || !organization_name) {
      console.log('[REGISTER API VALIDATION] Failed: Missing required fields.'); // Log validation failure
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    step = 'validating_email';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[REGISTER API VALIDATION] Failed: Invalid email format.'); // Log validation failure
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    step = 'validating_password';

    // Validate password strength
    if (password.length < 8) {
       console.log('[REGISTER API VALIDATION] Failed: Password too short.'); // Log validation failure
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    step = 'creating_organization';
    console.log('[REGISTER API LOG] Validation passed. Attempting to create organization...');

    // Create organization first
    const organization = await createOrganization({
      name: organization_name
    });
    console.log('[REGISTER API LOG] Organization created successfully:', organization.id);
    step = 'creating_user';
    console.log('[REGISTER API LOG] Attempting to create user...');

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
    console.log('[REGISTER API LOG] User created successfully:', user.id);
    step = 'sending_success_response';

    // Return success response with user data (excluding password)
    console.log('[REGISTER API LOG] Sending success response.');
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
    // Log the step where the error likely occurred
    console.error(`[REGISTER API ERROR] Error occurred around step: ${step}`); 
    console.error('[REGISTER API ERROR] Full error details:', error); // Log the error *explicitly* here

    // Handle specific known errors
    if (error.message && error.message.includes('duplicate key value violates unique constraint')) { // Check for unique constraint errors (like email)
       console.error('[REGISTER API ERROR] Specific error type: Email likely already in use.');
       return NextResponse.json(
         { error: 'Email already in use' },
         { status: 409 } // Conflict
       );
    }
    
    // Generic error response
    console.error('[REGISTER API ERROR] Sending generic 500 error response.');
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
