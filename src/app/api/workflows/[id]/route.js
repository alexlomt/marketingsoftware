export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getWorkflowById, updateWorkflow, deleteWorkflow } from '@/models/workflow';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific workflow operations
 * GET /api/workflows/[id] - Get a specific workflow
 * PUT /api/workflows/[id] - Update a workflow
 * DELETE /api/workflows/[id] - Delete a workflow
 */

// GET handler to retrieve a specific workflow
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
    
    // Get workflow
    const workflow = await getWorkflowById(id, organizationId);
    
    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    
    if (error.message === 'Workflow not found') {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve workflow' },
      { status: 500 }
    );
  }
}

// PUT handler to update a workflow
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
    const { name, description, trigger, actions, conditions, is_active } = body;
    
    // Validate actions if provided
    if (actions !== undefined && (!Array.isArray(actions) || actions.length === 0)) {
      return NextResponse.json(
        { error: 'At least one action is required' },
        { status: 400 }
      );
    }
    
    // Update workflow
    const workflow = await updateWorkflow(
      id,
      organizationId,
      { name, description, trigger, actions, conditions, is_active }
    );
    
    return NextResponse.json({
      message: 'Workflow updated successfully',
      workflow
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    
    if (error.message === 'Workflow not found') {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a workflow
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
    
    // Delete workflow
    await deleteWorkflow(id, organizationId);
    
    return NextResponse.json({
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Delete workflow error:', error);
    
    if (error.message === 'Workflow not found') {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
