import { NextResponse } from 'next/server';
import { getContactsStats, getDealsStats, getEmailCampaignStats } from '@/models/analytics';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for analytics and reporting
 * GET /api/analytics/contacts - Get contacts analytics
 * GET /api/analytics/deals - Get deals analytics
 * GET /api/analytics/email-campaigns - Get email campaigns analytics
 */

// GET handler to retrieve analytics data
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
    
    // Determine which analytics to fetch based on the path
    const { pathname } = new URL(request.url);
    const { searchParams } = new URL(request.url);
    
    // Parse common parameters
    const start_date = searchParams.get('start_date') || null;
    const end_date = searchParams.get('end_date') || null;
    const period = searchParams.get('period') || 'month'; // day, week, month, year
    
    // Fetch the appropriate analytics
    if (pathname.includes('/contacts')) {
      // Get contacts analytics
      const source = searchParams.get('source') || null;
      const stats = await getContactsStats(organizationId, { start_date, end_date, period, source });
      
      return NextResponse.json({ stats });
    } 
    else if (pathname.includes('/deals')) {
      // Get deals analytics
      const pipeline_id = searchParams.get('pipeline_id') || null;
      const stats = await getDealsStats(organizationId, { start_date, end_date, period, pipeline_id });
      
      return NextResponse.json({ stats });
    } 
    else if (pathname.includes('/email-campaigns')) {
      // Get email campaigns analytics
      const stats = await getEmailCampaignStats(organizationId, { start_date, end_date, period });
      
      return NextResponse.json({ stats });
    } 
    else {
      // Default to returning all analytics
      const [contactsStats, dealsStats, emailCampaignStats] = await Promise.all([
        getContactsStats(organizationId, { start_date, end_date, period }),
        getDealsStats(organizationId, { start_date, end_date, period }),
        getEmailCampaignStats(organizationId, { start_date, end_date, period })
      ]);
      
      return NextResponse.json({
        contacts: contactsStats,
        deals: dealsStats,
        emailCampaigns: emailCampaignStats
      });
    }
  } catch (error) {
    console.error('Get analytics error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}
