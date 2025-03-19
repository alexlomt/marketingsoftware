// Forms and form submissions utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new form
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} name - Form name
 * @param {Array} fields - Form fields
 * @param {Object} settings - Form settings
 * @returns {Promise<Object>} Form object
 */
export async function createForm(db, organizationId, name, fields, settings = {}) {
  // Generate form ID
  const id = generateId();
  
  // Insert form
  await insertRow(db, 'forms', {
    id,
    organization_id: organizationId,
    name,
    fields: JSON.stringify(fields),
    settings: JSON.stringify(settings),
  });
  
  // Return form
  return {
    id,
    organization_id: organizationId,
    name,
    fields,
    settings,
  };
}

/**
 * Get form by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Form ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Form object
 */
export async function getFormById(db, id, organizationId) {
  const form = await getRow(
    db,
    'SELECT * FROM forms WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!form) {
    throw new Error('Form not found');
  }
  
  // Parse fields and settings
  return {
    ...form,
    fields: JSON.parse(form.fields),
    settings: form.settings ? JSON.parse(form.settings) : {},
  };
}

/**
 * Get forms for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of form objects
 */
export async function getOrganizationForms(db, organizationId) {
  const forms = await getRows(
    db,
    'SELECT * FROM forms WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
  
  // Parse fields and settings
  return forms.map(form => ({
    ...form,
    fields: JSON.parse(form.fields),
    settings: form.settings ? JSON.parse(form.settings) : {},
  }));
}

/**
 * Update form
 * @param {D1Database} db - D1 database client
 * @param {string} id - Form ID
 * @param {string} organizationId - Organization ID
 * @param {Object} formData - Form data to update
 * @returns {Promise<Object>} Updated form object
 */
export async function updateForm(db, id, organizationId, formData) {
  // Check if form exists
  const form = await getFormById(db, id, organizationId);
  
  // Prepare update data
  const updateData = {
    name: formData.name !== undefined ? formData.name : form.name,
    fields: formData.fields !== undefined ? JSON.stringify(formData.fields) : form.fields,
    settings: formData.settings !== undefined ? JSON.stringify(formData.settings) : form.settings,
    updated_at: new Date().toISOString(),
  };
  
  // Update form
  await updateRow(db, 'forms', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated form
  return {
    ...form,
    name: formData.name !== undefined ? formData.name : form.name,
    fields: formData.fields !== undefined ? formData.fields : form.fields,
    settings: formData.settings !== undefined ? formData.settings : form.settings,
  };
}

/**
 * Delete form
 * @param {D1Database} db - D1 database client
 * @param {string} id - Form ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteForm(db, id, organizationId) {
  // Check if form exists
  await getFormById(db, id, organizationId);
  
  // Delete form
  await deleteRow(db, 'forms', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Submit form
 * @param {D1Database} db - D1 database client
 * @param {string} formId - Form ID
 * @param {Object} submissionData - Form submission data
 * @returns {Promise<Object>} Form submission object
 */
export async function submitForm(db, formId, submissionData) {
  // Check if form exists
  const form = await getRow(db, 'SELECT * FROM forms WHERE id = ?', [formId]);
  
  if (!form) {
    throw new Error('Form not found');
  }
  
  // Generate submission ID
  const id = generateId();
  
  // Insert submission
  await insertRow(db, 'form_submissions', {
    id,
    form_id: formId,
    data: JSON.stringify(submissionData),
  });
  
  // Return submission
  return {
    id,
    form_id: formId,
    data: submissionData,
    created_at: new Date().toISOString(),
  };
}

/**
 * Get form submissions
 * @param {D1Database} db - D1 database client
 * @param {string} formId - Form ID
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of form submission objects
 */
export async function getFormSubmissions(db, formId, organizationId, options = {}) {
  // Check if form exists and belongs to organization
  await getFormById(db, formId, organizationId);
  
  const { limit = 50, offset = 0 } = options;
  
  // Get submissions
  const submissions = await getRows(
    db,
    'SELECT * FROM form_submissions WHERE form_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [formId, limit, offset]
  );
  
  // Parse submission data
  return submissions.map(submission => ({
    ...submission,
    data: JSON.parse(submission.data),
  }));
}
