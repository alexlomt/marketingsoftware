import { NextResponse } from 'next/server';
import { getTagById, updateTag, deleteTag } from '@/models/tag';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific tag operations
 * GET /api/tags/[id] - Get a specific tag
 * PUT /api/tags/[id] - Update a tag
 * DELETE /api/tags/[id] - Delete a tag
 */

// GET handler to retrieve a specific tag
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
    
    // Get tag
    const tag = await getTagById(id, organizationId);
    
    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Get tag error:', error);
    
    if (error.message === 'Tag not found') {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve tag' },
      { status: 500 }
    );
  }
}

// PUT handler to update a tag
export async function PUT(request, { params }) {
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
    const { name, color } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // Update tag
    const tag = await updateTag(id, organizationId, { name, color });
    
    return NextResponse.json({
      message: 'Tag updated successfully',
      tag
    });
  } catch (error) {
    console.error('Update tag error:', error);
    
    if (error.message === 'Tag not found') {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Tag with this name already exists') {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a tag
export async function DELETE(request, { params }) {
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
    
    // Delete tag
    await deleteTag(id, organizationId);
    
    return NextResponse.json({
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    
    if (error.message === 'Tag not found') {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
