import { NextResponse } from 'next/server';
import { createAppointment, getAppointmentsByOrganization } from '@/models/appointment';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for appointments management
 * GET /api/appointments - Get all appointments
 * POST /api/appointments - Create a new appointment
 */

// GET handler to retrieve appointments
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
    const contact_id = searchParams.get('contact_id') || null;
    const start_date = searchParams.get('start_date') || null;
    const end_date = searchParams.get('end_date') || null;
    const status = searchParams.get('status') || null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Get appointments
    const appointments = await getAppointmentsByOrganization(
      organizationId,
      { contact_id, start_date, end_date, status, limit, offset }
    );
    
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve appointments' },
      { status: 500 }
    );
  }
}

// POST handler to create a new appointment
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
    const { 
      title, 
      description, 
      contact_id, 
      start_time, 
      end_time, 
      location,
      meeting_url,
      status,
      reminder_time
    } = body;
    
    // Validate required fields
    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Title, start time, and end time are required' },
        { status: 400 }
      );
    }
    
    // Validate time range
    if (new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }
    
    // Create appointment
    const appointment = await createAppointment(
      { 
        title, 
        description, 
        contact_id, 
        start_time, 
        end_time, 
        location,
        meeting_url,
        status,
        reminder_time
      },
      organizationId
    );
    
    return NextResponse.json(
      { message: 'Appointment created successfully', appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
