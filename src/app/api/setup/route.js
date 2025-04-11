// Use Node.js runtime as this route interacts with DB and auth
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { getDB, getRow, insertRow, generateId } from '@/lib/db';
import { hashPassword } from '@/lib/auth'; // Use hashPassword directly

/**
 * API route for initial application setup.
 * Creates the first organization and admin user.
 * Requires a valid SETUP_KEY environment variable.
 */
export async function POST(request) {
  const { SETUP_KEY } = getEnv();
  const db = await getDB();
  let client;

  try {
    // 1. Check if setup is allowed/needed
    const adminCheck = await getRow(db, "SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck) {
      return NextResponse.json(
        { error: 'Setup has already been completed.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { organizationName, name, email, password, setupKey } = body;

    // 3. Validate setup key
    if (!SETUP_KEY || setupKey !== SETUP_KEY) {
      console.warn('Invalid or missing setup key attempt.');
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      );
    }

    // 4. Validate required fields
    if (!organizationName || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Organization name, user name, email, and password are required' },
        { status: 400 }
      );
    }

    // Start transaction
    client = await db.connect();
    await client.query('BEGIN');

    // 5. Create Organization
    const organizationId = generateId();
    const orgData = {
      id: organizationId,
      name: organizationName,
      // Add other default organization fields if necessary
      created_at: new Date(),
      updated_at: new Date(),
    };
    const orgColumns = Object.keys(orgData).join(', ');
    const orgPlaceholders = Object.keys(orgData).map((_, i) => `$${i + 1}`).join(', ');
    await client.query(
        `INSERT INTO organizations (${orgColumns}) VALUES (${orgPlaceholders})`,
        Object.values(orgData)
    );
    console.log(`Organization created with ID: ${organizationId}`);

    // 6. Create Admin User
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    const userData = {
        id: userId,
        organization_id: organizationId,
        name: name,
        email: email,
        password_hash: passwordHash,
        role: 'admin', // Explicitly set role to admin
        created_at: new Date(),
        updated_at: new Date(),
    };
    const userColumns = Object.keys(userData).join(', ');
    const userPlaceholders = Object.keys(userData).map((_, i) => `$${i + 1}`).join(', ');
    await client.query(
        `INSERT INTO users (${userColumns}) VALUES (${userPlaceholders})`,
        Object.values(userData)
    );
    console.log(`Admin user created with ID: ${userId}`);

    // Commit transaction
    await client.query('COMMIT');

    // 7. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Setup completed successfully. Organization and admin user created.',
        organizationId: organizationId,
        userId: userId
      },
      { status: 201 } // Use 201 Created status
    );

  } catch (error) {
    // Rollback transaction on error
    if (client) {
        await client.query('ROLLBACK');
    }
    console.error('Setup failed:', error);

    // Check for unique constraint violation (e.g., email already exists, though initial check should prevent)
    if (error.code === '23505') { // PostgreSQL unique violation code
         return NextResponse.json(
           { error: 'Email already exists.' },
           { status: 409 } // Conflict
         );
    }

    return NextResponse.json(
      { error: 'An error occurred during setup.', details: error.message },
      { status: 500 }
    );
  } finally {
      // Release client connection
      if (client) {
          client.release();
      }
  }
}
