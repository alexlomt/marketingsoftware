export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { updatePipelineStage, deletePipelineStage } from '@/models/pipeline';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific pipeline stage operations
 * PUT /api/pipelines/[id]/stages/[stageId] - Update a stage
 * DELETE /api/pipelines/[id]/stages/[stageId] - Delete a stage
 */

// PUT handler to update a stage
export async function PUT(request, { params }) {
  try {
    const { id, stageId } = params;
    
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
    const { name, description } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Stage name is required' },
        { status: 400 }
      );
    }
    
    // Update stage
    const stage = await updatePipelineStage(stageId, id, organizationId, { name, description });
    
    return NextResponse.json({
      message: 'Pipeline stage updated successfully',
      stage
    });
  } catch (error) {
    console.error('Update pipeline stage error:', error);
    
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
    
    return NextResponse.json(
      { error: 'Failed to update pipeline stage' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a stage
export async function DELETE(request, { params }) {
  try {
    const { id, stageId } = params;
    
    // Get organization ID from request headers (set by middleware)
    const organizationId = getOrganizationId(request);
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Delete stage
    await deletePipelineStage(stageId, id, organizationId);
    
    return NextResponse.json({
      message: 'Pipeline stage deleted successfully'
    });
  } catch (error) {
    console.error('Delete pipeline stage error:', error);
    
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
    
    return NextResponse.json(
      { error: 'Failed to delete pipeline stage' },
      { status: 500 }
    );
  }
}
