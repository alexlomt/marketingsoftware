/**
 * Smart List model
 * Represents dynamic contact lists based on filter criteria
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new smart list
 * @param {Object} data - Smart list data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created smart list
 */
export async function createSmartList(data, organizationId) {
  const db = await getDB();
  const { name, filter_criteria, description } = data;
  
  // Check if smart list with same name already exists
  const existingList = await getRow(
    db,
    'SELECT * FROM smart_lists WHERE name = ? AND organization_id = ?',
    [name, organizationId]
  );
  
  if (existingList) {
    throw new Error('Smart list with this name already exists');
  }
  
  // Generate smart list ID
  const id = generateId();
  
  // Insert smart list
  await insertRow(db, 'smart_lists', {
    id,
    organization_id: organizationId,
    name,
    description: description || null,
    filter_criteria: JSON.stringify(filter_criteria || {}),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created smart list
  return getSmartListById(id, organizationId);
}

/**
 * Get smart list by ID
 * @param {string} id - Smart list ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Smart list object
 */
export async function getSmartListById(id, organizationId) {
  const db = await getDB();
  
  const smartList = await getRow(
    db,
    'SELECT * FROM smart_lists WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!smartList) {
    throw new Error('Smart list not found');
  }
  
  // Parse filter criteria
  if (smartList.filter_criteria) {
    smartList.filter_criteria = JSON.parse(smartList.filter_criteria);
  }
  
  return smartList;
}

/**
 * Get smart lists by organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of smart list objects
 */
export async function getSmartListsByOrganization(organizationId) {
  const db = await getDB();
  
  const smartLists = await getRows(
    db,
    'SELECT * FROM smart_lists WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
  
  // Parse filter criteria for each smart list
  return smartLists.map(list => {
    if (list.filter_criteria) {
      list.filter_criteria = JSON.parse(list.filter_criteria);
    }
    return list;
  });
}

/**
 * Update smart list
 * @param {string} id - Smart list ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Smart list data to update
 * @returns {Promise<Object>} Updated smart list
 */
export async function updateSmartList(id, organizationId, data) {
  const db = await getDB();
  
  // Check if smart list exists
  const smartList = await getSmartListById(id, organizationId);
  
  // If changing name, check if new name already exists
  if (data.name && data.name !== smartList.name) {
    const existingList = await getRow(
      db,
      'SELECT * FROM smart_lists WHERE name = ? AND organization_id = ? AND id != ?',
      [data.name, organizationId, id]
    );
    
    if (existingList) {
      throw new Error('Smart list with this name already exists');
    }
  }
  
  // Parse existing filter criteria
  const existingFilterCriteria = smartList.filter_criteria || {};
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : smartList.name,
    description: data.description !== undefined ? data.description : smartList.description,
    filter_criteria: data.filter_criteria !== undefined 
      ? JSON.stringify(data.filter_criteria) 
      : JSON.stringify(existingFilterCriteria),
    updated_at: new Date().toISOString()
  };
  
  // Update smart list
  await updateRow(db, 'smart_lists', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated smart list
  return getSmartListById(id, organizationId);
}

/**
 * Delete smart list
 * @param {string} id - Smart list ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteSmartList(id, organizationId) {
  const db = await getDB();
  
  // Check if smart list exists
  await getSmartListById(id, organizationId);
  
  // Delete smart list
  await deleteRow(db, 'smart_lists', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Get contacts for a smart list
 * @param {string} id - Smart list ID
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of contact objects
 */
export async function getSmartListContacts(id, organizationId, options = {}) {
  const db = await getDB();
  const { limit = 50, offset = 0, sort_by = 'created_at', sort_dir = 'desc' } = options;
  
  // Get smart list
  const smartList = await getSmartListById(id, organizationId);
  
  // Build query based on filter criteria
  let query = 'SELECT c.* FROM contacts c WHERE c.organization_id = ?';
  const params = [organizationId];
  
  // Apply filters
  const filterCriteria = smartList.filter_criteria || {};
  
  if (filterCriteria.tags && filterCriteria.tags.length > 0) {
    query += ` AND c.id IN (
      SELECT ct.contact_id 
      FROM contact_tags ct 
      JOIN tags t ON ct.tag_id = t.id 
      WHERE t.id IN (${filterCriteria.tags.map(() => '?').join(',')})
      AND t.organization_id = ?
    )`;
    params.push(...filterCriteria.tags, organizationId);
  }
  
  if (filterCriteria.status) {
    query += ' AND c.status = ?';
    params.push(filterCriteria.status);
  }
  
  if (filterCriteria.source) {
    query += ' AND c.source = ?';
    params.push(filterCriteria.source);
  }
  
  if (filterCriteria.search) {
    query += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
    const searchTerm = `%${filterCriteria.search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Add sorting
  query += ` ORDER BY c.${sort_by} ${sort_dir === 'asc' ? 'ASC' : 'DESC'}`;
  
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
