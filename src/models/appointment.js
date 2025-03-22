/**
 * Appointment model
 * Represents calendar appointments in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new appointment
 * @param {Object} data - Appointment data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created appointment
 */
export async function createAppointment(data, organizationId) {
  const db = await getDB();
  const { 
    contact_id, 
    user_id, 
    title, 
    description, 
    start_time, 
    end_time,
    location,
    meeting_link,
    status,
    reminder_time
  } = data;
  
  // Check if contact exists and belongs to organization if provided
  if (contact_id) {
    const contact = await getRow(
      db,
      'SELECT * FROM contacts WHERE id = ? AND organization_id = ?',
      [contact_id, organizationId]
    );
    
    if (!contact) {
      throw new Error('Contact not found');
    }
  }
  
  // Check if user exists and belongs to organization if provided
  if (user_id) {
    const user = await getRow(
      db,
      'SELECT * FROM users WHERE id = ? AND organization_id = ?',
      [user_id, organizationId]
    );
    
    if (!user) {
      throw new Error('User not found');
    }
  }
  
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
    location: location || null,
    meeting_link: meeting_link || null,
    status: status || 'scheduled',
    reminder_time: reminder_time || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created appointment
  return getAppointmentById(id, organizationId);
}

/**
 * Get appointment by ID
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Appointment object
 */
export async function getAppointmentById(id, organizationId) {
  const db = await getDB();
  
  const appointment = await getRow(
    db,
    'SELECT * FROM appointments WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  // Get contact info if available
  if (appointment.contact_id) {
    appointment.contact = await getRow(
      db,
      'SELECT id, first_name, last_name, email, phone FROM contacts WHERE id = ?',
      [appointment.contact_id]
    );
  }
  
  // Get user info if available
  if (appointment.user_id) {
    appointment.user = await getRow(
      db,
      'SELECT id, name, email FROM users WHERE id = ?',
      [appointment.user_id]
    );
  }
  
  return appointment;
}

/**
 * Get appointments by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of appointment objects
 */
export async function getAppointmentsByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { 
    contact_id, 
    user_id, 
    status,
    start_date,
    end_date,
    limit = 50, 
    offset = 0 
  } = options;
  
  // Build query
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
  
  // Add sorting and pagination
  query += ' ORDER BY start_time LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  // Get appointments
  const appointments = await getRows(db, query, params);
  
  // Get additional info for each appointment
  for (const appointment of appointments) {
    // Get contact info if available
    if (appointment.contact_id) {
      appointment.contact = await getRow(
        db,
        'SELECT id, first_name, last_name, email, phone FROM contacts WHERE id = ?',
        [appointment.contact_id]
      );
    }
    
    // Get user info if available
    if (appointment.user_id) {
      appointment.user = await getRow(
        db,
        'SELECT id, name, email FROM users WHERE id = ?',
        [appointment.user_id]
      );
    }
  }
  
  return appointments;
}

/**
 * Update appointment
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Appointment data to update
 * @returns {Promise<Object>} Updated appointment
 */
export async function updateAppointment(id, organizationId, data) {
  const db = await getDB();
  
  // Check if appointment exists
  const appointment = await getAppointmentById(id, organizationId);
  
  // Check if contact exists and belongs to organization if changing
  if (data.contact_id && data.contact_id !== appointment.contact_id) {
    const contact = await getRow(
      db,
      'SELECT * FROM contacts WHERE id = ? AND organization_id = ?',
      [data.contact_id, organizationId]
    );
    
    if (!contact) {
      throw new Error('Contact not found');
    }
  }
  
  // Check if user exists and belongs to organization if changing
  if (data.user_id && data.user_id !== appointment.user_id) {
    const user = await getRow(
      db,
      'SELECT * FROM users WHERE id = ? AND organization_id = ?',
      [data.user_id, organizationId]
    );
    
    if (!user) {
      throw new Error('User not found');
    }
  }
  
  // Prepare update data
  const updateData = {
    contact_id: data.contact_id !== undefined ? data.contact_id : appointment.contact_id,
    user_id: data.user_id !== undefined ? data.user_id : appointment.user_id,
    title: data.title !== undefined ? data.title : appointment.title,
    description: data.description !== undefined ? data.description : appointment.description,
    start_time: data.start_time !== undefined ? data.start_time : appointment.start_time,
    end_time: data.end_time !== undefined ? data.end_time : appointment.end_time,
    location: data.location !== undefined ? data.location : appointment.location,
    meeting_link: data.meeting_link !== undefined ? data.meeting_link : appointment.meeting_link,
    status: data.status !== undefined ? data.status : appointment.status,
    reminder_time: data.reminder_time !== undefined ? data.reminder_time : appointment.reminder_time,
    updated_at: new Date().toISOString()
  };
  
  // Update appointment
  await updateRow(db, 'appointments', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated appointment
  return getAppointmentById(id, organizationId);
}

/**
 * Delete appointment
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteAppointment(id, organizationId) {
  const db = await getDB();
  
  // Check if appointment exists
  await getAppointmentById(id, organizationId);
  
  // Delete appointment
  await deleteRow(db, 'appointments', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Get upcoming appointments
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of appointment objects
 */
export async function getUpcomingAppointments(organizationId, options = {}) {
  const db = await getDB();
  const { user_id, days = 7, limit = 10 } = options;
  
  // Calculate date range
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + days);
  
  // Build query
  let query = `
    SELECT * FROM appointments 
    WHERE organization_id = ? 
    AND start_time >= ? 
    AND start_time <= ?
    AND status = 'scheduled'
  `;
  const params = [
    organizationId, 
    now.toISOString(), 
    endDate.toISOString()
  ];
  
  // Add user filter if provided
  if (user_id) {
    query += ' AND user_id = ?';
    params.push(user_id);
  }
  
  // Add sorting and limit
  query += ' ORDER BY start_time LIMIT ?';
  params.push(limit);
  
  // Get appointments
  const appointments = await getRows(db, query, params);
  
  // Get additional info for each appointment
  for (const appointment of appointments) {
    // Get contact info if available
    if (appointment.contact_id) {
      appointment.contact = await getRow(
        db,
        'SELECT id, first_name, last_name, email, phone FROM contacts WHERE id = ?',
        [appointment.contact_id]
      );
    }
    
    // Get user info if available
    if (appointment.user_id) {
      appointment.user = await getRow(
        db,
        'SELECT id, name, email FROM users WHERE id = ?',
        [appointment.user_id]
      );
    }
  }
  
  return appointments;
}

/**
 * Update appointment status
 * @param {string} id - Appointment ID
 * @param {string} organizationId - Organization ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated appointment
 */
export async function updateAppointmentStatus(id, organizationId, status) {
  const db = await getDB();
  
  // Check if appointment exists
  await getAppointmentById(id, organizationId);
  
  // Update status
  await updateRow(
    db,
    'appointments',
    {
      status,
      updated_at: new Date().toISOString()
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated appointment
  return getAppointmentById(id, organizationId);
}
