import { NextResponse } from 'next/server';
import { getFormSubmissions, getFormSubmissionById } from '@/models/form';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for form submissions
 * GET /api/forms/[id]/submissions - Get all submissions for a form
 * GET /api/forms/[id]/submissions/[submissionId] - Get a specific submission
 */

// GET handler to retrieve form submissions
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
    
    // Check if this is a specific submission request
    const { pathname } = new URL(request.url);
    const submissionIdMatch = pathname.match(/\/submissions\/([^\/]+)$/);
    
    if (submissionIdMatch) {
      // Get specific submission
      const submissionId = submissionIdMatch[1];
      const submission = await getFormSubmissionById(id, submissionId, organizationId);
      
      return NextResponse.json({ submission });
    } else {
      // Get all submissions for this form
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);
      const sort_by = searchParams.get('sort_by') || 'created_at';
      const sort_dir = searchParams.get('sort_dir') || 'desc';
      
      const submissions = await getFormSubmissions(
        id, 
        organizationId,
        { limit, offset, sort_by, sort_dir }
      );
      
      return NextResponse.json({ submissions });
    }
  } catch (error) {
    console.error('Get form submissions error:', error);
    
    if (error.message === 'Form not found') {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Submission not found') {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve form submissions' },
      { status: 500 }
    );
  }
}
