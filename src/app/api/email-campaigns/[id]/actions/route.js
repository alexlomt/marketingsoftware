import { NextResponse } from 'next/server';
import { scheduleEmailCampaign, cancelScheduledEmailCampaign, sendEmailCampaign } from '@/models/emailCampaign';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for email campaign actions
 * POST /api/email-campaigns/[id]/actions - Perform actions on an email campaign
 */

// POST handler to perform actions on an email campaign
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
    const { action, scheduled_at, recipient_ids } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    let campaign;
    
    // Perform the requested action
    switch (action) {
      case 'schedule':
        if (!scheduled_at) {
          return NextResponse.json(
            { error: 'Scheduled date/time is required' },
            { status: 400 }
          );
        }
        
        campaign = await scheduleEmailCampaign(id, organizationId, scheduled_at);
        
        return NextResponse.json({
          message: 'Email campaign scheduled successfully',
          campaign
        });
        
      case 'cancel':
        campaign = await cancelScheduledEmailCampaign(id, organizationId);
        
        return NextResponse.json({
          message: 'Email campaign schedule cancelled successfully',
          campaign
        });
        
      case 'send':
        if (!recipient_ids || !Array.isArray(recipient_ids) || recipient_ids.length === 0) {
          return NextResponse.json(
            { error: 'Recipient IDs are required' },
            { status: 400 }
          );
        }
        
        campaign = await sendEmailCampaign(id, organizationId, recipient_ids);
        
        return NextResponse.json({
          message: 'Email campaign sent successfully',
          campaign
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email campaign action error:', error);
    
    if (error.message === 'Email campaign not found') {
      return NextResponse.json(
        { error: 'Email campaign not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Cannot schedule a sent campaign') {
      return NextResponse.json(
        { error: 'Cannot schedule a sent campaign' },
        { status: 400 }
      );
    }
    
    if (error.message === 'Can only cancel scheduled campaigns') {
      return NextResponse.json(
        { error: 'Can only cancel scheduled campaigns' },
        { status: 400 }
      );
    }
    
    if (error.message === 'Campaign has already been sent') {
      return NextResponse.json(
        { error: 'Campaign has already been sent' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to perform action on email campaign' },
      { status: 500 }
    );
  }
}
