export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createPipelineStage, updatePipelineStage, deletePipelineStage, reorderPipelineStages } from '@/models/pipeline';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for pipeline stages management
 * POST /api/pipelines/[id]/stages - Create a new stage
 * PUT /api/pipelines/[id]/stages/[stageId] - Update a stage
 * DELETE /api/pipelines/[id]/stages/[stageId] - Delete a stage
 * POST /api/pipelines/[id]/stages/reorder - Reorder stages
 */

// POST handler to create a new stage
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
    
    // Check if this is a reorder request
    if (body.action === 'reorder' && Array.isArray(body.stageIds)) {
      // Reorder stages
      const stages = await reorderPipelineStages(id, organizationId, body.stageIds);
      
      return NextResponse.json({
        message: 'Pipeline stages reordered successfully',
        stages
      });
    }
    
    // Regular stage creation
    const { name, description } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Stage name is required' },
        { status: 400 }
      );
    }
    
    // Create stage
    const stage = await createPipelineStage(id, organizationId, { name, description });
    
    return NextResponse.json(
      { message: 'Pipeline stage created successfully', stage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create/reorder pipeline stage error:', error);
    
    if (error.message === 'Pipeline not found') {
      return NextResponse.json(
        { error: 'Pipeline not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Pipeline stage')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create/reorder pipeline stage' },
      { status: 500 }
    );
  }
}
