export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Added runtime specifier

import { NextResponse } from 'next/server';
import { createContact, getContactsByOrganization } from '@/models/contact';
import { withAuth, getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for contacts management
 * GET /api/contacts - Get all contacts
 * POST /api/contacts - Create a new contact
 */

// GET handler to retrieve contacts
export async function GET(request) {
  try {
    // Get organization ID from request headers (set by middleware)
    const organizationId = getOrganizationId(request);
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || null;
    const status = searchParams.get('status') || null;
    const source = searchParams.get('source') || null;
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_dir = searchParams.get('sort_dir') || 'desc';
    
    // Get contacts
    const contacts = await getContactsByOrganization(
      organizationId,
      { limit, offset, search, status, source, sort_by, sort_dir }
    );
    
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve contacts' },
      { status: 500 }
    );
  }
}

// POST handler to create a new contact
export async function POST(request) {
  try {
    // Get organization ID from request headers (set by middleware)
    const organizationId = getOrganizationId(request);
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }
    
    // Create contact
    const contact = await createContact(body, organizationId);
    
    return NextResponse.json(
      { message: 'Contact created successfully', contact },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create contact error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
