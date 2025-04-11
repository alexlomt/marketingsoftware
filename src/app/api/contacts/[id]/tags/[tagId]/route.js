export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { removeTagFromContact } from '@/models/tag';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for removing a specific tag from a contact
 * DELETE /api/contacts/[id]/tags/[tagId] - Remove a tag from a contact
 */

// DELETE handler to remove a tag from a contact
export async function DELETE(request, { params }) {
  try {
    const { id, tagId } = params;
    
    // Get organization ID from request headers (set by middleware)
    const organizationId = getOrganizationId(request);
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Remove tag from contact
    await removeTagFromContact(id, tagId, organizationId);
    
    return NextResponse.json({
      message: 'Tag removed from contact successfully'
    });
  } catch (error) {
    console.error('Remove tag from contact error:', error);
    
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
    
    return NextResponse.json(
      { error: 'Failed to remove tag from contact' },
      { status: 500 }
    );
  }
}
