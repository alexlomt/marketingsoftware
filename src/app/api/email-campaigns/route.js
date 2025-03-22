import { NextResponse } from 'next/server';
import { createEmailCampaign, getEmailCampaignsByOrganization } from '@/models/emailCampaign';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for email campaigns management
 * GET /api/email-campaigns - Get all email campaigns
 * POST /api/email-campaigns - Create a new email campaign
 */

// GET handler to retrieve email campaigns
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
    const status = searchParams.get('status') || null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_dir = searchParams.get('sort_dir') || 'desc';
    
    // Get email campaigns
    const campaigns = await getEmailCampaignsByOrganization(
      organizationId,
      { status, limit, offset, sort_by, sort_dir }
    );
    
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Get email campaigns error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve email campaigns' },
      { status: 500 }
    );
  }
}

// POST handler to create a new email campaign
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
    const { name, subject, content, sender_name, sender_email, reply_to, template_id } = body;
    
    // Validate required fields
    if (!name || !subject || !content) {
      return NextResponse.json(
        { error: 'Name, subject, and content are required' },
        { status: 400 }
      );
    }
    
    // Create email campaign
    const campaign = await createEmailCampaign(
      { name, subject, content, sender_name, sender_email, reply_to, template_id },
      organizationId
    );
    
    return NextResponse.json(
      { message: 'Email campaign created successfully', campaign },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create email campaign error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create email campaign' },
      { status: 500 }
    );
  }
}
