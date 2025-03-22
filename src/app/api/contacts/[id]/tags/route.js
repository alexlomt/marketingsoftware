import { NextResponse } from 'next/server';
import { addTagToContact, removeTagFromContact, getContactTags } from '@/models/tag';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for contact tag operations
 * GET /api/contacts/[id]/tags - Get all tags for a contact
 * POST /api/contacts/[id]/tags - Add a tag to a contact
 * DELETE /api/contacts/[id]/tags/[tagId] - Remove a tag from a contact
 */

// GET handler to retrieve tags for a contact
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get organization ID from request headers (set by middleware)
    const organizationId = getOrganizationId(request);
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get tags for contact
    const tags = await getContactTags(id, organizationId);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Get contact tags error:', error);
    
    if (error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve contact tags' },
      { status: 500 }
    );
  }
}

// POST handler to add a tag to a contact
export async function POST(request, { params }) {
  try {
    const { id } = params;
    
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
    const { tag_id } = body;
    
    if (!tag_id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }
    
    // Add tag to contact
    const result = await addTagToContact(id, tag_id, organizationId);
    
    return NextResponse.json({
      message: 'Tag added to contact successfully',
      tag: result
    });
  } catch (error) {
    console.error('Add tag to contact error:', error);
    
    if (error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Tag not found') {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Contact already has this tag') {
      return NextResponse.json(
        { error: 'Contact already has this tag' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add tag to contact' },
      { status: 500 }
    );
  }
}
