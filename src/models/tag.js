/**
 * Tag model
 * Represents tags that can be applied to contacts in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new tag
 * @param {Object} data - Tag data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created tag
 */
export async function createTag(data, organizationId) {
  const db = await getDB();
  const { name, color } = data;
  
  // Check if tag with same name already exists
  const existingTag = await getRow(
    db,
    'SELECT * FROM tags WHERE name = ? AND organization_id = ?',
    [name, organizationId]
  );
  
  if (existingTag) {
    throw new Error('Tag with this name already exists');
  }
  
  // Generate tag ID
  const id = generateId();
  
  // Insert tag
  await insertRow(db, 'tags', {
    id,
    organization_id: organizationId,
    name,
    color: color || '#6366F1', // Default indigo color
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created tag
  return getTagById(id, organizationId);
}

/**
 * Get tag by ID
 * @param {string} id - Tag ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Tag object
 */
export async function getTagById(id, organizationId) {
  const db = await getDB();
  
  const tag = await getRow(
    db,
    'SELECT * FROM tags WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!tag) {
    throw new Error('Tag not found');
  }
  
  return tag;
}

/**
 * Get tags by organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of tag objects
 */
export async function getTagsByOrganization(organizationId) {
  const db = await getDB();
  
  return getRows(
    db,
    'SELECT * FROM tags WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
}

/**
 * Update tag
 * @param {string} id - Tag ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Tag data to update
 * @returns {Promise<Object>} Updated tag
 */
export async function updateTag(id, organizationId, data) {
  const db = await getDB();
  
  // Check if tag exists
  const tag = await getTagById(id, organizationId);
  
  // If changing name, check if new name already exists
  if (data.name && data.name !== tag.name) {
    const existingTag = await getRow(
      db,
      'SELECT * FROM tags WHERE name = ? AND organization_id = ? AND id != ?',
      [data.name, organizationId, id]
    );
    
    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }
  }
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : tag.name,
    color: data.color !== undefined ? data.color : tag.color,
    updated_at: new Date().toISOString()
  };
  
  // Update tag
  await updateRow(db, 'tags', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated tag
  return getTagById(id, organizationId);
}

/**
 * Delete tag
 * @param {string} id - Tag ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteTag(id, organizationId) {
  const db = await getDB();
  
  // Check if tag exists
  await getTagById(id, organizationId);
  
  // Delete tag
  await deleteRow(db, 'tags', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Add tag to contact
 * @param {string} contactId - Contact ID
 * @param {string} tagId - Tag ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Contact tag object
 */
export async function addTagToContact(contactId, tagId, organizationId) {
  const db = await getDB();
  
  // Check if contact exists and belongs to organization
  const contact = await getRow(
    db,
    'SELECT * FROM contacts WHERE id = ? AND organization_id = ?',
    [contactId, organizationId]
  );
  
  if (!contact) {
    throw new Error('Contact not found');
  }
  
  // Check if tag exists and belongs to organization
  const tag = await getTagById(tagId, organizationId);
  
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
    created_at: new Date().toISOString()
  });
  
  // Return contact tag
  return {
    id,
    contact_id: contactId,
    tag_id: tagId,
    tag_name: tag.name,
    tag_color: tag.color
  };
}

/**
 * Remove tag from contact
 * @param {string} contactId - Contact ID
 * @param {string} tagId - Tag ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function removeTagFromContact(contactId, tagId, organizationId) {
  const db = await getDB();
  
  // Check if contact exists and belongs to organization
  const contact = await getRow(
    db,
    'SELECT * FROM contacts WHERE id = ? AND organization_id = ?',
    [contactId, organizationId]
  );
  
  if (!contact) {
    throw new Error('Contact not found');
  }
  
  // Check if tag exists and belongs to organization
  await getTagById(tagId, organizationId);
  
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
 * @param {string} contactId - Contact ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of tag objects
 */
export async function getContactTags(contactId, organizationId) {
  const db = await getDB();
  
  // Check if contact exists and belongs to organization
  const contact = await getRow(
    db,
    'SELECT * FROM contacts WHERE id = ? AND organization_id = ?',
    [contactId, organizationId]
  );
  
  if (!contact) {
    throw new Error('Contact not found');
  }
  
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
