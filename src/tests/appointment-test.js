// Test for appointment scheduling functionality

import { initTestDB, createTestUser, createTestOrganization, createTestContact, cleanupTestData } from '../lib/test-utils';
import { createAppointment, getAppointmentById, getOrganizationAppointments, updateAppointment, deleteAppointment, confirmAppointment, cancelAppointment, completeAppointment } from '../lib/appointments';

/**
 * Test appointment scheduling functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testAppointments(env) {
  console.log('Testing appointment scheduling functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user, organization, and contact
    console.log('Creating test user, organization, and contact...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    const contact = await createTestContact(db, organization.id);
    
    // Test create appointment
    console.log('Testing create appointment...');
    const now = new Date();
    const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const appointmentData = {
      contact_id: contact.id,
      user_id: user.id,
      title: 'Initial Consultation',
      description: 'Discuss project requirements',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    };
    
    const appointment = await createAppointment(db, organization.id, appointmentData);
    console.log('Appointment created successfully:', appointment);
    
    if (!appointment.id || 
        appointment.title !== appointmentData.title || 
        appointment.contact_id !== appointmentData.contact_id) {
      throw new Error('Create appointment failed: Invalid appointment data');
    }
    
    // Test get appointment by ID
    console.log('Testing get appointment by ID...');
    const retrievedAppointment = await getAppointmentById(db, appointment.id, organization.id);
    console.log('Appointment retrieved successfully:', retrievedAppointment);
    
    if (retrievedAppointment.id !== appointment.id || retrievedAppointment.title !== appointmentData.title) {
      throw new Error('Get appointment by ID failed: Invalid appointment data');
    }
    
    // Test get organization appointments
    console.log('Testing get organization appointments...');
    const appointments = await getOrganizationAppointments(db, organization.id);
    console.log('Organization appointments retrieved successfully:', appointments);
    
    if (appointments.length !== 1 || appointments[0].id !== appointment.id) {
      throw new Error('Get organization appointments failed: Appointment not found');
    }
    
    // Test update appointment
    console.log('Testing update appointment...');
    const updatedAppointmentData = {
      title: 'Updated Consultation',
      description: 'Discuss updated project requirements'
    };
    
    const updatedAppointment = await updateAppointment(
      db, 
      appointment.id, 
      organization.id, 
      updatedAppointmentData
    );
    console.log('Appointment updated successfully:', updatedAppointment);
    
    if (updatedAppointment.title !== updatedAppointmentData.title || 
        updatedAppointment.description !== updatedAppointmentData.description) {
      throw new Error('Update appointment failed: Appointment not updated correctly');
    }
    
    // Test confirm appointment
    console.log('Testing confirm appointment...');
    const confirmedAppointment = await confirmAppointment(db, appointment.id, organization.id);
    console.log('Appointment confirmed successfully:', confirmedAppointment);
    
    if (confirmedAppointment.status !== 'confirmed') {
      throw new Error('Confirm appointment failed: Appointment not confirmed');
    }
    
    // Create another appointment for testing cancellation
    const cancelAppointmentData = {
      contact_id: contact.id,
      user_id: user.id,
      title: 'Follow-up Meeting',
      start_time: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // 2 days later
      end_time: new Date(now.getTime() + 49 * 60 * 60 * 1000).toISOString() // 1 hour after start
    };
    
    const appointmentToCancel = await createAppointment(db, organization.id, cancelAppointmentData);
    
    // Test cancel appointment
    console.log('Testing cancel appointment...');
    const cancelledAppointment = await cancelAppointment(db, appointmentToCancel.id, organization.id);
    console.log('Appointment cancelled successfully:', cancelledAppointment);
    
    if (cancelledAppointment.status !== 'cancelled') {
      throw new Error('Cancel appointment failed: Appointment not cancelled');
    }
    
    // Test complete appointment
    console.log('Testing complete appointment...');
    const completedAppointment = await completeAppointment(db, appointment.id, organization.id);
    console.log('Appointment completed successfully:', completedAppointment);
    
    if (completedAppointment.status !== 'completed') {
      throw new Error('Complete appointment failed: Appointment not completed');
    }
    
    // Test delete appointment
    console.log('Testing delete appointment...');
    await deleteAppointment(db, appointmentToCancel.id, organization.id);
    
    // Verify appointment was deleted
    try {
      await getAppointmentById(db, appointmentToCancel.id, organization.id);
      throw new Error('Delete appointment failed: Appointment still exists');
    } catch (error) {
      if (error.message !== 'Appointment not found') {
        throw error;
      }
      console.log('Appointment deleted successfully');
    }
    
    console.log('Appointment scheduling tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Appointment scheduling tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
