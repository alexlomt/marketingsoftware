export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/models/deal';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific deal operations
 * GET /api/deals/[id] - Get a specific deal
 * PUT /api/deals/[id] - Update a deal
 * DELETE /api/deals/[id] - Delete a deal
 */

// GET handler to retrieve a specific deal
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
    
    // Get deal
    const deal = await getDealById(id, organizationId);
    
    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Get deal error:', error);
    
    if (error.message === 'Deal not found') {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve deal' },
      { status: 500 }
    );
  }
}

// PUT handler to update a deal
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
    
    // Update deal
    const deal = await updateDeal(id, organizationId, body);
    
    return NextResponse.json({
      message: 'Deal updated successfully',
      deal
    });
  } catch (error) {
    console.error('Update deal error:', error);
    
    if (error.message === 'Deal not found') {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
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
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a deal
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
    
    // Delete deal
    await deleteDeal(id, organizationId);
    
    return NextResponse.json({
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    
    if (error.message === 'Deal not found') {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
