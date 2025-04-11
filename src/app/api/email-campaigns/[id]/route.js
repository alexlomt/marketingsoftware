export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getEmailCampaignById, updateEmailCampaign, deleteEmailCampaign } from '@/models/emailCampaign';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific email campaign operations
 * GET /api/email-campaigns/[id] - Get a specific email campaign
 * PUT /api/email-campaigns/[id] - Update an email campaign
 * DELETE /api/email-campaigns/[id] - Delete an email campaign
 */

// GET handler to retrieve a specific email campaign
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
    
    // Get email campaign
    const campaign = await getEmailCampaignById(id, organizationId);
    
    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Get email campaign error:', error);
    
    if (error.message === 'Email campaign not found') {
      return NextResponse.json(
        { error: 'Email campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve email campaign' },
      { status: 500 }
    );
  }
}

// PUT handler to update an email campaign
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
    
    // Update email campaign
    const campaign = await updateEmailCampaign(id, organizationId, body);
    
    return NextResponse.json({
      message: 'Email campaign updated successfully',
      campaign
    });
  } catch (error) {
    console.error('Update email campaign error:', error);
    
    if (error.message === 'Email campaign not found') {
      return NextResponse.json(
        { error: 'Email campaign not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Cannot update a sent campaign') {
      return NextResponse.json(
        { error: 'Cannot update a sent campaign' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update email campaign' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete an email campaign
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
    
    // Delete email campaign
    await deleteEmailCampaign(id, organizationId);
    
    return NextResponse.json({
      message: 'Email campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete email campaign error:', error);
    
    if (error.message === 'Email campaign not found') {
      return NextResponse.json(
        { error: 'Email campaign not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Cannot delete a sent campaign') {
      return NextResponse.json(
        { error: 'Cannot delete a sent campaign' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete email campaign' },
      { status: 500 }
    );
  }
}
