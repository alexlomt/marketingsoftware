// Organization management utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new organization
 * @param {D1Database} db - D1 database client
 * @param {string} name - Organization name
 * @param {string} ownerId - User ID of the organization owner
 * @returns {Promise<Object>} Organization object
 */
export async function createOrganization(db, name, ownerId) {
  // Generate organization ID
  const id = generateId();
  
  // Insert organization
  await insertRow(db, 'organizations', {
    id,
    name,
    owner_id: ownerId,
  });
  
  // Add owner as a member with 'owner' role
  await insertRow(db, 'organization_members', {
    id: generateId(),
    organization_id: id,
    user_id: ownerId,
    role: 'owner',
  });
  
  // Return organization
  return {
    id,
    name,
    owner_id: ownerId,
  };
}

/**
 * Get organization by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Organization object
 */
export async function getOrganizationById(db, id) {
  const organization = await getRow(db, 'SELECT * FROM organizations WHERE id = ?', [id]);
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  return organization;
}

/**
 * Get organizations for a user
 * @param {D1Database} db - D1 database client
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of organization objects
 */
export async function getUserOrganizations(db, userId) {
  const query = `
    SELECT o.* 
    FROM organizations o
    JOIN organization_members om ON o.id = om.organization_id
    WHERE om.user_id = ?
  `;
  
  return getRows(db, query, [userId]);
}

/**
 * Update organization
 * @param {D1Database} db - D1 database client
 * @param {string} id - Organization ID
 * @param {Object} data - Organization data to update
 * @returns {Promise<Object>} Updated organization object
 */
export async function updateOrganization(db, id, data) {
  const { name } = data;
  
  // Check if organization exists
  const organization = await getOrganizationById(db, id);
  
  // Update organization
  await updateRow(db, 'organizations', {
    name: name || organization.name,
    updated_at: new Date().toISOString(),
  }, 'id = ?', [id]);
  
  // Return updated organization
  return {
    ...organization,
    name: name || organization.name,
  };
}

/**
 * Delete organization
 * @param {D1Database} db - D1 database client
 * @param {string} id - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteOrganization(db, id) {
  // Check if organization exists
  await getOrganizationById(db, id);
  
  // Delete organization
  await deleteRow(db, 'organizations', 'id = ?', [id]);
}

/**
 * Add member to organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID
 * @param {string} role - Member role ('admin' or 'member')
 * @returns {Promise<Object>} Member object
 */
export async function addOrganizationMember(db, organizationId, userId, role) {
  // Check if organization exists
  await getOrganizationById(db, organizationId);
  
  // Check if user is already a member
  const existingMember = await getRow(
    db,
    'SELECT * FROM organization_members WHERE organization_id = ? AND user_id = ?',
    [organizationId, userId]
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this organization');
  }
  
  // Validate role
  if (!['admin', 'member'].includes(role)) {
    throw new Error('Invalid role. Must be "admin" or "member"');
  }
  
  // Add member
  const memberId = generateId();
  await insertRow(db, 'organization_members', {
    id: memberId,
    organization_id: organizationId,
    user_id: userId,
    role,
  });
  
  // Return member
  return {
    id: memberId,
    organization_id: organizationId,
    user_id: userId,
    role,
  };
}

/**
 * Remove member from organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function removeOrganizationMember(db, organizationId, userId) {
  // Check if organization exists
  const organization = await getOrganizationById(db, organizationId);
  
  // Cannot remove owner
  if (organization.owner_id === userId) {
    throw new Error('Cannot remove the organization owner');
  }
  
  // Check if user is a member
  const member = await getRow(
    db,
    'SELECT * FROM organization_members WHERE organization_id = ? AND user_id = ?',
    [organizationId, userId]
  );
  
  if (!member) {
    throw new Error('User is not a member of this organization');
  }
  
  // Remove member
  await deleteRow(
    db,
    'organization_members',
    'organization_id = ? AND user_id = ?',
    [organizationId, userId]
  );
}

/**
 * Get organization members
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of member objects
 */
export async function getOrganizationMembers(db, organizationId) {
  // Check if organization exists
  await getOrganizationById(db, organizationId);
  
  // Get members
  const query = `
    SELECT om.*, u.name, u.email
    FROM organization_members om
    JOIN users u ON om.user_id = u.id
    WHERE om.organization_id = ?
  `;
  
  return getRows(db, query, [organizationId]);
}

/**
 * Update member role
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID
 * @param {string} role - New role ('admin' or 'member')
 * @returns {Promise<Object>} Updated member object
 */
export async function updateMemberRole(db, organizationId, userId, role) {
  // Check if organization exists
  const organization = await getOrganizationById(db, organizationId);
  
  // Cannot change owner's role
  if (organization.owner_id === userId) {
    throw new Error('Cannot change the role of the organization owner');
  }
  
  // Check if user is a member
  const member = await getRow(
    db,
    'SELECT * FROM organization_members WHERE organization_id = ? AND user_id = ?',
    [organizationId, userId]
  );
  
  if (!member) {
    throw new Error('User is not a member of this organization');
  }
  
  // Validate role
  if (!['admin', 'member'].includes(role)) {
    throw new Error('Invalid role. Must be "admin" or "member"');
  }
  
  // Update role
  await updateRow(
    db,
    'organization_members',
    { role, updated_at: new Date().toISOString() },
    'organization_id = ? AND user_id = ?',
    [organizationId, userId]
  );
  
  // Return updated member
  return {
    ...member,
    role,
  };
}
