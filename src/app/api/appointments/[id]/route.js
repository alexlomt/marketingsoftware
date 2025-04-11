export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, deleteAppointment } from '@/models/appointment';
import { getOrganizationId } from '@/lib/auth-utils';

/**
 * API route for specific appointment operations
 * GET /api/appointments/[id] - Get a specific appointment
 * PUT /api/appointments/[id] - Update an appointment
 * DELETE /api/appointments/[id] - Delete an appointment
 */

// GET handler to retrieve a specific appointment
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
    
    // Get appointment
    const appointment = await getAppointmentById(id, organizationId);
    
    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    
    if (error.message === 'Appointment not found') {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve appointment' },
      { status: 500 }
    );
  }
}

// PUT handler to update an appointment
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
    
    // Validate time range if both are provided
    if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }
    
    // Update appointment
    const appointment = await updateAppointment(
      id,
      organizationId,
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
      }
    );
    
    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    
    if (error.message === 'Appointment not found') {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete an appointment
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
    
    // Delete appointment
    await deleteAppointment(id, organizationId);
    
    return NextResponse.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    
    if (error.message === 'Appointment not found') {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
