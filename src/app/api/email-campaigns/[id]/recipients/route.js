import { NextResponse } from 'next/server';
import { getCampaignRecipients, getCampaignStatistics, updateRecipientStatus } from '@/models/emailCampaign';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for email campaign recipients
 * GET /api/email-campaigns/[id]/recipients - Get recipients for an email campaign
 * GET /api/email-campaigns/[id]/statistics - Get statistics for an email campaign
 * PUT /api/email-campaigns/[id]/recipients/[contactId] - Update recipient status
 */

// GET handler to retrieve campaign recipients or statistics
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
    
    // Check if this is a statistics request
    const { pathname } = new URL(request.url);
    const isStatistics = pathname.endsWith('/statistics');
    
    if (isStatistics) {
      // Get campaign statistics
      const statistics = await getCampaignStatistics(id, organizationId);
      
      return NextResponse.json({ statistics });
    } else {
      // Get campaign recipients
      const recipients = await getCampaignRecipients(id, organizationId);
      
      return NextResponse.json({ recipients });
    }
  } catch (error) {
    console.error('Get campaign recipients/statistics error:', error);
    
    if (error.message === 'Email campaign not found') {
      return NextResponse.json(
        { error: 'Email campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve campaign recipients/statistics' },
      { status: 500 }
    );
  }
}
