export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createWorkflow, getWorkflowsByOrganization } from '@/models/workflow';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for workflows management
 * GET /api/workflows - Get all workflows
 * POST /api/workflows - Create a new workflow
 */

// GET handler to retrieve workflows
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
    const is_active = searchParams.get('is_active') === 'true' ? true : 
                      searchParams.get('is_active') === 'false' ? false : null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Get workflows
    const workflows = await getWorkflowsByOrganization(
      organizationId,
      { is_active, limit, offset }
    );
    
    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve workflows' },
      { status: 500 }
    );
  }
}

// POST handler to create a new workflow
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
    const { name, description, trigger, actions, conditions, is_active } = body;
    
    // Validate required fields
    if (!name || !trigger || !actions || !Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: 'Name, trigger, and at least one action are required' },
        { status: 400 }
      );
    }
    
    // Create workflow
    const workflow = await createWorkflow(
      { name, description, trigger, actions, conditions, is_active },
      organizationId
    );
    
    return NextResponse.json(
      { message: 'Workflow created successfully', workflow },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create workflow error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
