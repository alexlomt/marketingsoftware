// Appointment scheduling utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new appointment
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Appointment object
 */
export async function createAppointment(db, organizationId, appointmentData) {
  const { contact_id, user_id, title, description, start_time, end_time } = appointmentData;
  
  // Generate appointment ID
  const id = generateId();
  
  // Insert appointment
  await insertRow(db, 'appointments', {
    id,
    organization_id: organizationId,
    contact_id: contact_id || null,
    user_id: user_id || null,
    title,
    description: description || null,
    start_time,
    end_time,
    status: 'scheduled',
  });
  
  // Return appointment
  return {
    id,
    organization_id: organizationId,
    contact_id: contact_id || null,
    user_id: user_id || null,
    title,
    description: description || null,
    start_time,
    end_time,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get appointment by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Appointment object
 */
export async function getAppointmentById(db, id, organizationId) {
  const appointment = await getRow(
    db,
    'SELECT * FROM appointments WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  return appointment;
}

/**
 * Get appointments for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of appointment objects
 */
export async function getOrganizationAppointments(db, organizationId, options = {}) {
  const { contact_id, user_id, status, start_date, end_date, limit = 50, offset = 0 } = options;
  
  let query = 'SELECT * FROM appointments WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add filters
  if (contact_id) {
    query += ' AND contact_id = ?';
    params.push(contact_id);
  }
  
  if (user_id) {
    query += ' AND user_id = ?';
    params.push(user_id);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (start_date) {
    query += ' AND start_time >= ?';
    params.push(start_date);
  }
  
  if (end_date) {
    query += ' AND end_time <= ?';
    params.push(end_date);
  }
  
  // Add pagination
  query += ' ORDER BY start_time ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return getRows(db, query, params);
}

/**
 * Update appointment
 * @param {D1Database} db - D1 database client
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @param {Object} appointmentData - Appointment data to update
 * @returns {Promise<Object>} Updated appointment object
 */
export async function updateAppointment(db, id, organizationId, appointmentData) {
  // Check if appointment exists
  const appointment = await getAppointmentById(db, id, organizationId);
  
  // Cannot update completed or cancelled appointments
  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw new Error(`Cannot update a ${appointment.status} appointment`);
  }
  
  // Prepare update data
  const updateData = {
    contact_id: appointmentData.contact_id !== undefined ? appointmentData.contact_id : appointment.contact_id,
    user_id: appointmentData.user_id !== undefined ? appointmentData.user_id : appointment.user_id,
    title: appointmentData.title !== undefined ? appointmentData.title : appointment.title,
    description: appointmentData.description !== undefined ? appointmentData.description : appointment.description,
    start_time: appointmentData.start_time !== undefined ? appointmentData.start_time : appointment.start_time,
    end_time: appointmentData.end_time !== undefined ? appointmentData.end_time : appointment.end_time,
    updated_at: new Date().toISOString(),
  };
  
  // Update appointment
  await updateRow(db, 'appointments', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated appointment
  return {
    ...appointment,
    ...updateData,
  };
}

/**
 * Delete appointment
 * @param {D1Database} db - D1 database client
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteAppointment(db, id, organizationId) {
  // Check if appointment exists
  await getAppointmentById(db, id, organizationId);
  
  // Delete appointment
  await deleteRow(db, 'appointments', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Confirm appointment
 * @param {D1Database} db - D1 database client
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated appointment object
 */
export async function confirmAppointment(db, id, organizationId) {
  // Check if appointment exists
  const appointment = await getAppointmentById(db, id, organizationId);
  
  // Can only confirm scheduled appointments
  if (appointment.status !== 'scheduled') {
    throw new Error(`Cannot confirm a ${appointment.status} appointment`);
  }
  
  // Update appointment
  await updateRow(
    db,
    'appointments',
    { status: 'confirmed', updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated appointment
  return {
    ...appointment,
    status: 'confirmed',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Cancel appointment
 * @param {D1Database} db - D1 database client
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated appointment object
 */
export async function cancelAppointment(db, id, organizationId) {
  // Check if appointment exists
  const appointment = await getAppointmentById(db, id, organizationId);
  
  // Cannot cancel completed appointments
  if (appointment.status === 'completed') {
    throw new Error('Cannot cancel a completed appointment');
  }
  
  // Update appointment
  await updateRow(
    db,
    'appointments',
    { status: 'cancelled', updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated appointment
  return {
    ...appointment,
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Complete appointment
 * @param {D1Database} db - D1 database client
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated appointment object
 */
export async function completeAppointment(db, id, organizationId) {
  // Check if appointment exists
  const appointment = await getAppointmentById(db, id, organizationId);
  
  // Cannot complete cancelled appointments
  if (appointment.status === 'cancelled') {
    throw new Error('Cannot complete a cancelled appointment');
  }
  
  // Update appointment
  await updateRow(
    db,
    'appointments',
    { status: 'completed', updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated appointment
  return {
    ...appointment,
    status: 'completed',
    updated_at: new Date().toISOString(),
  };
}
