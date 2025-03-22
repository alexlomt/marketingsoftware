import { NextResponse } from 'next/server';
import { createForm, getFormsByOrganization } from '@/models/form';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for forms management
 * GET /api/forms - Get all forms
 * POST /api/forms - Create a new form
 */

// GET handler to retrieve forms
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
    const is_published = searchParams.get('is_published') === 'true' ? true : 
                         searchParams.get('is_published') === 'false' ? false : null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Get forms
    const forms = await getFormsByOrganization(
      organizationId,
      { is_published, limit, offset }
    );
    
    return NextResponse.json({ forms });
  } catch (error) {
    console.error('Get forms error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve forms' },
      { status: 500 }
    );
  }
}

// POST handler to create a new form
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
    const { title, description, fields, settings, is_published } = body;
    
    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Form title is required' },
        { status: 400 }
      );
    }
    
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'Form must have at least one field' },
        { status: 400 }
      );
    }
    
    // Create form
    const form = await createForm(
      { title, description, fields, settings, is_published },
      organizationId
    );
    
    return NextResponse.json(
      { message: 'Form created successfully', form },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create form error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}
