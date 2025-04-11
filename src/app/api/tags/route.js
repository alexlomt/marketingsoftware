export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createTag, getTagsByOrganization } from '@/models/tag';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for tags management
 * GET /api/tags - Get all tags
 * POST /api/tags - Create a new tag
 */

// GET handler to retrieve tags
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
    
    // Get tags
    const tags = await getTagsByOrganization(organizationId);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve tags' },
      { status: 500 }
    );
  }
}

// POST handler to create a new tag
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
    const { name, color } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // Create tag
    const tag = await createTag({ name, color }, organizationId);
    
    return NextResponse.json(
      { message: 'Tag created successfully', tag },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create tag error:', error);
    
    if (error.message === 'Tag with this name already exists') {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
