// CRM utilities for contact management

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new contact
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} contactData - Contact data
 * @returns {Promise<Object>} Contact object
 */
export async function createContact(db, organizationId, contactData) {
  // Generate contact ID
  const id = generateId();
  
  // Insert contact
  await insertRow(db, 'contacts', {
    id,
    organization_id: organizationId,
    first_name: contactData.first_name || null,
    last_name: contactData.last_name || null,
    email: contactData.email || null,
    phone: contactData.phone || null,
    address: contactData.address || null,
    city: contactData.city || null,
    state: contactData.state || null,
    zip: contactData.zip || null,
    country: contactData.country || null,
  });
  
  // Return contact
  return {
    id,
    organization_id: organizationId,
    ...contactData,
  };
}

/**
 * Get contact by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Contact ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Contact object
 */
export async function getContactById(db, id, organizationId) {
  const contact = await getRow(
    db,
    'SELECT * FROM contacts WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!contact) {
    throw new Error('Contact not found');
  }
  
  return contact;
}

/**
 * Get contacts for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of contact objects
 */
export async function getOrganizationContacts(db, organizationId, options = {}) {
  const { limit = 50, offset = 0, search = null } = options;
  
  let query = 'SELECT * FROM contacts WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add search condition if provided
  if (search) {
    query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Add pagination
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return getRows(db, query, params);
}

/**
 * Update contact
 * @param {D1Database} db - D1 database client
 * @param {string} id - Contact ID
 * @param {string} organizationId - Organization ID
 * @param {Object} contactData - Contact data to update
 * @returns {Promise<Object>} Updated contact object
 */
export async function updateContact(db, id, organizationId, contactData) {
  // Check if contact exists
  const contact = await getContactById(db, id, organizationId);
  
  // Prepare update data
  const updateData = {
    first_name: contactData.first_name !== undefined ? contactData.first_name : contact.first_name,
    last_name: contactData.last_name !== undefined ? contactData.last_name : contact.last_name,
    email: contactData.email !== undefined ? contactData.email : contact.email,
    phone: contactData.phone !== undefined ? contactData.phone : contact.phone,
    address: contactData.address !== undefined ? contactData.address : contact.address,
    city: contactData.city !== undefined ? contactData.city : contact.city,
    state: contactData.state !== undefined ? contactData.state : contact.state,
    zip: contactData.zip !== undefined ? contactData.zip : contact.zip,
    country: contactData.country !== undefined ? contactData.country : contact.country,
    updated_at: new Date().toISOString(),
  };
  
  // Update contact
  await updateRow(db, 'contacts', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated contact
  return {
    ...contact,
    ...updateData,
  };
}

/**
 * Delete contact
 * @param {D1Database} db - D1 database client
 * @param {string} id - Contact ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteContact(db, id, organizationId) {
  // Check if contact exists
  await getContactById(db, id, organizationId);
  
  // Delete contact
  await deleteRow(db, 'contacts', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Create a new tag
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} name - Tag name
 * @param {string} color - Tag color (hex code)
 * @returns {Promise<Object>} Tag object
 */
export async function createTag(db, organizationId, name, color = null) {
  // Check if tag already exists
  const existingTag = await getRow(
    db,
    'SELECT * FROM tags WHERE organization_id = ? AND name = ?',
    [organizationId, name]
  );
  
  if (existingTag) {
    throw new Error('Tag already exists');
  }
  
  // Generate tag ID
  const id = generateId();
  
  // Insert tag
  await insertRow(db, 'tags', {
    id,
    organization_id: organizationId,
    name,
    color,
  });
  
  // Return tag
  return {
    id,
    organization_id: organizationId,
    name,
    color,
  };
}

/**
 * Get tags for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of tag objects
 */
export async function getOrganizationTags(db, organizationId) {
  return getRows(
    db,
    'SELECT * FROM tags WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
}

/**
 * Add tag to contact
 * @param {D1Database} db - D1 database client
 * @param {string} contactId - Contact ID
 * @param {string} tagId - Tag ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Contact tag object
 */
export async function addTagToContact(db, contactId, tagId, organizationId) {
  // Check if contact exists and belongs to organization
  await getContactById(db, contactId, organizationId);
  
  // Check if tag exists and belongs to organization
  const tag = await getRow(
    db,
    'SELECT * FROM tags WHERE id = ? AND organization_id = ?',
    [tagId, organizationId]
  );
  
  if (!tag) {
    throw new Error('Tag not found');
  }
  
  // Check if contact already has this tag
  const existingContactTag = await getRow(
    db,
    'SELECT * FROM contact_tags WHERE contact_id = ? AND tag_id = ?',
    [contactId, tagId]
  );
  
  if (existingContactTag) {
    throw new Error('Contact already has this tag');
  }
  
  // Generate contact tag ID
  const id = generateId();
  
  // Add tag to contact
  await insertRow(db, 'contact_tags', {
    id,
    contact_id: contactId,
    tag_id: tagId,
  });
  
  // Return contact tag
  return {
    id,
    contact_id: contactId,
    tag_id: tagId,
  };
}

/**
 * Remove tag from contact
 * @param {D1Database} db - D1 database client
 * @param {string} contactId - Contact ID
 * @param {string} tagId - Tag ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function removeTagFromContact(db, contactId, tagId, organizationId) {
  // Check if contact exists and belongs to organization
  await getContactById(db, contactId, organizationId);
  
  // Check if tag exists and belongs to organization
  const tag = await getRow(
    db,
    'SELECT * FROM tags WHERE id = ? AND organization_id = ?',
    [tagId, organizationId]
  );
  
  if (!tag) {
    throw new Error('Tag not found');
  }
  
  // Remove tag from contact
  await deleteRow(
    db,
    'contact_tags',
    'contact_id = ? AND tag_id = ?',
    [contactId, tagId]
  );
}

/**
 * Get tags for a contact
 * @param {D1Database} db - D1 database client
 * @param {string} contactId - Contact ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of tag objects
 */
export async function getContactTags(db, contactId, organizationId) {
  // Check if contact exists and belongs to organization
  await getContactById(db, contactId, organizationId);
  
  // Get tags
  const query = `
    SELECT t.*
    FROM tags t
    JOIN contact_tags ct ON t.id = ct.tag_id
    WHERE ct.contact_id = ? AND t.organization_id = ?
    ORDER BY t.name
  `;
  
  return getRows(db, query, [contactId, organizationId]);
}

/**
 * Create a smart list
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} name - Smart list name
 * @param {Object} filterCriteria - Filter criteria
 * @returns {Promise<Object>} Smart list object
 */
export async function createSmartList(db, organizationId, name, filterCriteria) {
  // Generate smart list ID
  const id = generateId();
  
  // Insert smart list
  await insertRow(db, 'smart_lists', {
    id,
    organization_id: organizationId,
    name,
    filter_criteria: JSON.stringify(filterCriteria),
  });
  
  // Return smart list
  return {
    id,
    organization_id: organizationId,
    name,
    filter_criteria: filterCriteria,
  };
}

/**
 * Get smart lists for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of smart list objects
 */
export async function getOrganizationSmartLists(db, organizationId) {
  const smartLists = await getRows(
    db,
    'SELECT * FROM smart_lists WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
  
  // Parse filter criteria
  return smartLists.map(list => ({
    ...list,
    filter_criteria: JSON.parse(list.filter_criteria),
  }));
}

/**
 * Get contacts for a smart list
 * @param {D1Database} db - D1 database client
 * @param {string} smartListId - Smart list ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of contact objects
 */
export async function getSmartListContacts(db, smartListId, organizationId) {
  // Get smart list
  const smartList = await getRow(
    db,
    'SELECT * FROM smart_lists WHERE id = ? AND organization_id = ?',
    [smartListId, organizationId]
  );
  
  if (!smartList) {
    throw new Error('Smart list not found');
  }
  
  // Parse filter criteria
  const filterCriteria = JSON.parse(smartList.filter_criteria);
  
  // Build query based on filter criteria
  let query = 'SELECT c.* FROM contacts c WHERE c.organization_id = ?';
  const params = [organizationId];
  
  // Apply filters
  if (filterCriteria.tags && filterCriteria.tags.length > 0) {
    query += ` AND c.id IN (
      SELECT ct.contact_id 
      FROM contact_tags ct 
      JOIN tags t ON ct.tag_id = t.id 
      WHERE t.id IN (${filterCriteria.tags.map(() => '?').join(',')})
    )`;
    params.push(...filterCriteria.tags);
  }
  
  if (filterCriteria.search) {
    query += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
    const searchTerm = `%${filterCriteria.search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Add sorting
  query += ' ORDER BY c.created_at DESC';
  
  return getRows(db, query, params);
}
