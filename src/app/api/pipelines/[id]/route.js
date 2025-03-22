import { NextResponse } from 'next/server';
import { getPipelineById, updatePipeline, deletePipeline } from '@/models/pipeline';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific pipeline operations
 * GET /api/pipelines/[id] - Get a specific pipeline
 * PUT /api/pipelines/[id] - Update a pipeline
 * DELETE /api/pipelines/[id] - Delete a pipeline
 */

// GET handler to retrieve a specific pipeline
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
    
    // Get pipeline
    const pipeline = await getPipelineById(id, organizationId);
    
    return NextResponse.json({ pipeline });
  } catch (error) {
    console.error('Get pipeline error:', error);
    
    if (error.message === 'Pipeline not found') {
      return NextResponse.json(
        { error: 'Pipeline not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve pipeline' },
      { status: 500 }
    );
  }
}

// PUT handler to update a pipeline
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
    const { name, description } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Pipeline name is required' },
        { status: 400 }
      );
    }
    
    // Update pipeline
    const pipeline = await updatePipeline(id, organizationId, { name, description });
    
    return NextResponse.json({
      message: 'Pipeline updated successfully',
      pipeline
    });
  } catch (error) {
    console.error('Update pipeline error:', error);
    
    if (error.message === 'Pipeline not found') {
      return NextResponse.json(
        { error: 'Pipeline not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Pipeline with this name already exists') {
      return NextResponse.json(
        { error: 'Pipeline with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update pipeline' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a pipeline
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
    
    // Delete pipeline
    await deletePipeline(id, organizationId);
    
    return NextResponse.json({
      message: 'Pipeline deleted successfully'
    });
  } catch (error) {
    console.error('Delete pipeline error:', error);
    
    if (error.message === 'Pipeline not found') {
      return NextResponse.json(
        { error: 'Pipeline not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete pipeline' },
      { status: 500 }
    );
  }
}
