export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createPipeline, getPipelinesByOrganization } from '@/models/pipeline';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for pipelines management
 * GET /api/pipelines - Get all pipelines
 * POST /api/pipelines - Create a new pipeline
 */

// GET handler to retrieve pipelines
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
    
    // Get pipelines
    const pipelines = await getPipelinesByOrganization(organizationId);
    
    return NextResponse.json({ pipelines });
  } catch (error) {
    console.error('Get pipelines error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve pipelines' },
      { status: 500 }
    );
  }
}

// POST handler to create a new pipeline
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
    const { name, description, stages } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Pipeline name is required' },
        { status: 400 }
      );
    }
    
    // Create pipeline
    const pipeline = await createPipeline({ name, description, stages }, organizationId);
    
    return NextResponse.json(
      { message: 'Pipeline created successfully', pipeline },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create pipeline error:', error);
    
    if (error.message === 'Pipeline with this name already exists') {
      return NextResponse.json(
        { error: 'Pipeline with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create pipeline' },
      { status: 500 }
    );
  }
}
