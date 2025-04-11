export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { submitForm, createContact } from '@/models/form';

/**
 * API route for public form submissions
 * POST /api/forms/public/[id]/submit - Submit a form publicly
 */

// POST handler to submit a form publicly
export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Parse request body
    const body = await request.json();
    const { data } = body;
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }
    
    // Submit form
    const submission = await submitForm(id, data);
    
    return NextResponse.json({
      message: 'Form submitted successfully',
      submission_id: submission.id
    });
  } catch (error) {
    console.error('Submit form error:', error);
    
    if (error.message === 'Form not found') {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Form is not published') {
      return NextResponse.json(
        { error: 'This form is not currently accepting submissions' },
        { status: 403 }
      );
    }
    
    if (error.message.includes('Required field')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
