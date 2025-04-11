export const runtime = 'nodejs'; // Added runtime specifier

import { NextResponse } from 'next/server';
import { createDeal, getDealsByOrganization } from '@/models/deal';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for deals management
 * GET /api/deals - Get all deals
 * POST /api/deals - Create a new deal
 */

// GET handler to retrieve deals
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
    const pipeline_id = searchParams.get('pipeline_id') || null;
    const stage_id = searchParams.get('stage_id') || null;
    const contact_id = searchParams.get('contact_id') || null;
    const status = searchParams.get('status') || null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_dir = searchParams.get('sort_dir') || 'desc';
    
    // Get deals
    const deals = await getDealsByOrganization(
      organizationId,
      { pipeline_id, stage_id, contact_id, status, limit, offset, sort_by, sort_dir }
    );
    
    return NextResponse.json({ deals });
  } catch (error) {
    console.error('Get deals error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve deals' },
      { status: 500 }
    );
  }
}

// POST handler to create a new deal
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
    const { pipeline_id, stage_id, contact_id, title, value, currency, expected_close_date, description, status } = body;
    
    // Validate required fields
    if (!pipeline_id || !stage_id || !title) {
      return NextResponse.json(
        { error: 'Pipeline ID, stage ID, and title are required' },
        { status: 400 }
      );
    }
    
    // Create deal
    const deal = await createDeal(
      { pipeline_id, stage_id, contact_id, title, value, currency, expected_close_date, description, status },
      organizationId
    );
    
    return NextResponse.json(
      { message: 'Deal created successfully', deal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create deal error:', error);
    
    if (error.message === 'Pipeline not found') {
      return NextResponse.json(
        { error: 'Pipeline not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Pipeline stage not found') {
      return NextResponse.json(
        { error: 'Pipeline stage not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
