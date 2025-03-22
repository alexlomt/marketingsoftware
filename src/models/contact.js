/**
 * Contact model
 * Represents a contact in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new contact
 * @param {Object} data - Contact data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created contact
 */
export async function createContact(data, organizationId) {
  const db = await getDB();
  const { 
    first_name, 
    last_name, 
    email, 
    phone, 
    address, 
    city, 
    state, 
    zip_code, 
    country,
    status,
    source,
    custom_fields
  } = data;
  
  // Generate contact ID
  const id = generateId();
  
  // Insert contact
  await insertRow(db, 'contacts', {
    id,
    organization_id: organizationId,
    first_name,
    last_name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    city: city || null,
    state: state || null,
    zip_code: zip_code || null,
    country: country || null,
    status: status || 'lead',
    source: source || null,
    custom_fields: custom_fields ? JSON.stringify(custom_fields) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created contact
  return getContactById(id, organizationId);
}

/**
 * Get contact by ID
 * @param {string} id - Contact ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Contact object
 */
export async function getContactById(id, organizationId) {
  const db = await getDB();
  
  const contact = await getRow(
    db, 
    'SELECT * FROM contacts WHERE id = ? AND organization_id = ?', 
    [id, organizationId]
  );
  
  if (!contact) {
    throw new Error('Contact not found');
  }
  
  // Parse custom fields if present
  if (contact.custom_fields) {
    contact.custom_fields = JSON.parse(contact.custom_fields);
  }
  
  return contact;
}

/**
 * Get contacts by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of contact objects
 */
export async function getContactsByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { 
    limit = 50, 
    offset = 0, 
    search = null, 
    status = null, 
    source = null,
    sort_by = 'created_at',
    sort_dir = 'desc'
  } = options;
  
  let query = 'SELECT * FROM contacts WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add filters
  if (search) {
    query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (source) {
    query += ' AND source = ?';
    params.push(source);
  }
  
  // Add sorting
  query += ` ORDER BY ${sort_by} ${sort_dir === 'asc' ? 'ASC' : 'DESC'}`;
  
  // Add pagination
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const contacts = await getRows(db, query, params);
  
  // Parse custom fields for each contact
  return contacts.map(contact => {
    if (contact.custom_fields) {
      contact.custom_fields = JSON.parse(contact.custom_fields);
    }
    return contact;
  });
}

/**
 * Update contact
 * @param {string} id - Contact ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Contact data to update
 * @returns {Promise<Object>} Updated contact
 */
export async function updateContact(id, organizationId, data) {
  const db = await getDB();
  
  // Check if contact exists
  const contact = await getContactById(id, organizationId);
  
  // Parse existing custom fields
  let existingCustomFields = {};
  if (contact.custom_fields) {
    existingCustomFields = typeof contact.custom_fields === 'string' 
      ? JSON.parse(contact.custom_fields) 
      : contact.custom_fields;
  }
  
  // Merge custom fields
  const mergedCustomFields = data.custom_fields 
    ? { ...existingCustomFields, ...data.custom_fields }
    : existingCustomFields;
  
  // Prepare update data
  const updateData = {
    first_name: data.first_name !== undefined ? data.first_name : contact.first_name,
    last_name: data.last_name !== undefined ? data.last_name : contact.last_name,
    email: data.email !== undefined ? data.email : contact.email,
    phone: data.phone !== undefined ? data.phone : contact.phone,
    address: data.address !== undefined ? data.address : contact.address,
    city: data.city !== undefined ? data.city : contact.city,
    state: data.state !== undefined ? data.state : contact.state,
    zip_code: data.zip_code !== undefined ? data.zip_code : contact.zip_code,
    country: data.country !== undefined ? data.country : contact.country,
    status: data.status !== undefined ? data.status : contact.status,
    source: data.source !== undefined ? data.source : contact.source,
    custom_fields: Object.keys(mergedCustomFields).length > 0 ? JSON.stringify(mergedCustomFields) : null,
    updated_at: new Date().toISOString()
  };
  
  // Update contact
  await updateRow(db, 'contacts', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated contact
  return getContactById(id, organizationId);
}

/**
 * Delete contact
 * @param {string} id - Contact ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteContact(id, organizationId) {
  const db = await getDB();
  
  // Check if contact exists
  await getContactById(id, organizationId);
  
  // Delete contact
  await deleteRow(db, 'contacts', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Get contact count by organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<number>} Contact count
 */
export async function getContactCount(organizationId) {
  const db = await getDB();
  
  const result = await getRow(
    db, 
    'SELECT COUNT(*) as count FROM contacts WHERE organization_id = ?', 
    [organizationId]
  );
  
  return result.count;
}

/**
 * Get contact count by status
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Contact counts by status
 */
export async function getContactCountByStatus(organizationId) {
  const db = await getDB();
  
  const results = await getRows(
    db, 
    'SELECT status, COUNT(*) as count FROM contacts WHERE organization_id = ? GROUP BY status', 
    [organizationId]
  );
  
  // Convert to object
  const countByStatus = {};
  results.forEach(row => {
    countByStatus[row.status] = row.count;
  });
  
  return countByStatus;
}
