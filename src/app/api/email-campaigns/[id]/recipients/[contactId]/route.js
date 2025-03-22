import { NextResponse } from 'next/server';
import { updateRecipientStatus } from '@/models/emailCampaign';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for updating email campaign recipient status
 * PUT /api/email-campaigns/[id]/recipients/[contactId] - Update recipient status
 */

// PUT handler to update recipient status
export async function PUT(request, { params }) {
  try {
    const { id, contactId } = params;
    
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
    const { status } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['sent', 'opened', 'clicked', 'bounced'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: sent, opened, clicked, bounced' },
        { status: 400 }
      );
    }
    
    // Update recipient status
    const recipient = await updateRecipientStatus(id, contactId, status);
    
    return NextResponse.json({
      message: 'Recipient status updated successfully',
      recipient
    });
  } catch (error) {
    console.error('Update recipient status error:', error);
    
    if (error.message === 'Recipient not found') {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update recipient status' },
      { status: 500 }
    );
  }
}
