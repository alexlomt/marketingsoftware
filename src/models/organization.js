// src/models/organization.js
/**
 * Organization model
 * Represents a company or organization in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new organization
 * @param {Object} data - Organization data
 * @returns {Promise<Object>} Created organization
 */
export async function createOrganization(data) {
  const db = await getDB();
  const { name, industry, website, phone, address } = data;

  // Generate organization ID
  const id = generateId();

  // Insert organization
  await insertRow(db, 'organizations', {
    id,
    name,
    industry: industry || null,
    website: website || null,
    phone: phone || null,
    address: address || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Return created organization (already uses correct placeholders internally via getRow)
  return getOrganizationById(id);
}

/**
 * Get organization by ID
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Organization object
 */
export async function getOrganizationById(id) {
  const db = await getDB();
  // Use $1 for placeholder
  const organization = await getRow(db, 'SELECT * FROM organizations WHERE id = $1', [id]);

  if (!organization) {
    throw new Error('Organization not found');
  }

  return organization;
}

/**
 * Get all organizations
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of organization objects
 */
export async function getAllOrganizations(options = {}) {
  const db = await getDB();
  const { limit = 50, offset = 0 } = options;

  // Use $1, $2 for placeholders
  return getRows(db, 'SELECT * FROM organizations ORDER BY name LIMIT $1 OFFSET $2', [limit, offset]);
}

/**
 * Update organization
 * @param {string} id - Organization ID
 * @param {Object} data - Organization data to update
 * @returns {Promise<Object>} Updated organization
 */
export async function updateOrganization(id, data) {
  const db = await getDB();

  // Check if organization exists (getOrganizationById now uses correct placeholder)
  const organization = await getOrganizationById(id);

  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : organization.name,
    industry: data.industry !== undefined ? data.industry : organization.industry,
    website: data.website !== undefined ? data.website : organization.website,
    phone: data.phone !== undefined ? data.phone : organization.phone,
    address: data.address !== undefined ? data.address : organization.address,
    updated_at: new Date().toISOString()
  };

  // Update organization
  // Use $1 for placeholder in whereClause
  await updateRow(db, 'organizations', updateData, 'id = $1', [id]);

  // Return updated organization (getOrganizationById now uses correct placeholder)
  return getOrganizationById(id);
}

/**
 * Delete organization
 * @param {string} id - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteOrganization(id) {
  const db = await getDB();

  // Check if organization exists (getOrganizationById now uses correct placeholder)
  await getOrganizationById(id);

  // Delete organization
  // Use $1 for placeholder
  await deleteRow(db, 'organizations', 'id = $1', [id]);
}
