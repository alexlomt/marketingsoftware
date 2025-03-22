import { NextResponse } from 'next/server';
import { getFormById, updateForm, deleteForm } from '@/models/form';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific form operations
 * GET /api/forms/[id] - Get a specific form
 * PUT /api/forms/[id] - Update a form
 * DELETE /api/forms/[id] - Delete a form
 */

// GET handler to retrieve a specific form
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
    
    // Get form
    const form = await getFormById(id, organizationId);
    
    return NextResponse.json({ form });
  } catch (error) {
    console.error('Get form error:', error);
    
    if (error.message === 'Form not found') {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve form' },
      { status: 500 }
    );
  }
}

// PUT handler to update a form
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
    const { title, description, fields, settings, is_published } = body;
    
    // Validate required fields
    if (title === '') {
      return NextResponse.json(
        { error: 'Form title cannot be empty' },
        { status: 400 }
      );
    }
    
    if (fields && (!Array.isArray(fields) || fields.length === 0)) {
      return NextResponse.json(
        { error: 'Form must have at least one field' },
        { status: 400 }
      );
    }
    
    // Update form
    const form = await updateForm(
      id, 
      organizationId, 
      { title, description, fields, settings, is_published }
    );
    
    return NextResponse.json({
      message: 'Form updated successfully',
      form
    });
  } catch (error) {
    console.error('Update form error:', error);
    
    if (error.message === 'Form not found') {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a form
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
    
    // Delete form
    await deleteForm(id, organizationId);
    
    return NextResponse.json({
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    
    if (error.message === 'Form not found') {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
