/**
 * Form model for managing form data
 */

const { db, generateId } = require('../lib/db');

/**
 * Create a new form
 * @param {Object} formData - Form data
 * @returns {Promise<Object>} Created form
 */
async function createForm(formData) {
  const id = generateId();
  const timestamp = new Date().toISOString();
  
  const form = {
    id,
    name: formData.name,
    description: formData.description || '',
    fields: JSON.stringify(formData.fields || []),
    settings: JSON.stringify(formData.settings || {}),
    created_at: timestamp,
    updated_at: timestamp,
    user_id: formData.user_id,
    status: formData.status || 'active',
    form_type: formData.form_type || 'contact',
    is_public: formData.is_public || false
  };
  
  const query = `
    INSERT INTO forms (
      id, name, description, fields, settings, created_at, updated_at, 
      user_id, status, form_type, is_public
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    ) RETURNING *
  `;
  
  const values = [
    form.id, form.name, form.description, form.fields, form.settings,
    form.created_at, form.updated_at, form.user_id, form.status,
    form.form_type, form.is_public
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

/**
 * Get a form by ID
 * @param {string} id - Form ID
 * @returns {Promise<Object>} Form data
 */
async function getFormById(id) {
  const query = 'SELECT * FROM forms WHERE id = $1';
  const result = await db.query(query, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const form = result.rows[0];
  
  // Parse JSON fields
  try {
    form.fields = JSON.parse(form.fields);
    form.settings = JSON.parse(form.settings);
  } catch (error) {
    console.error('Error parsing form JSON fields:', error);
  }
  
  return form;
}

/**
 * Get forms by user ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Forms
 */
async function getFormsByUserId(userId, options = {}) {
  const { limit = 100, offset = 0, status = 'active' } = options;
  
  const query = `
    SELECT * FROM forms 
    WHERE user_id = $1 AND status = $2
    ORDER BY updated_at DESC
    LIMIT $3 OFFSET $4
  `;
  
  const result = await db.query(query, [userId, status, limit, offset]);
  
  // Parse JSON fields
  return result.rows.map(form => {
    try {
      form.fields = JSON.parse(form.fields);
      form.settings = JSON.parse(form.settings);
    } catch (error) {
      console.error('Error parsing form JSON fields:', error);
    }
    return form;
  });
}

/**
 * Get forms by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Forms
 */
async function getFormsByOrganization(organizationId, options = {}) {
  const { limit = 100, offset = 0, status = 'active' } = options;
  
  const query = `
    SELECT f.* FROM forms f
    JOIN users u ON f.user_id = u.id
    WHERE u.organization_id = $1 AND f.status = $2
    ORDER BY f.updated_at DESC
    LIMIT $3 OFFSET $4
  `;
  
  const result = await db.query(query, [organizationId, status, limit, offset]);
  
  // Parse JSON fields
  return result.rows.map(form => {
    try {
      form.fields = JSON.parse(form.fields);
      form.settings = JSON.parse(form.settings);
    } catch (error) {
      console.error('Error parsing form JSON fields:', error);
    }
    return form;
  });
}

/**
 * Update a form
 * @param {string} id - Form ID
 * @param {Object} formData - Updated form data
 * @returns {Promise<Object>} Updated form
 */
async function updateForm(id, formData) {
  const timestamp = new Date().toISOString();
  
  // Prepare update data
  const updateData = {
    updated_at: timestamp
  };
  
  // Add optional fields if provided
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.description !== undefined) updateData.description = formData.description;
  if (formData.fields !== undefined) updateData.fields = JSON.stringify(formData.fields);
  if (formData.settings !== undefined) updateData.settings = JSON.stringify(formData.settings);
  if (formData.status !== undefined) updateData.status = formData.status;
  if (formData.form_type !== undefined) updateData.form_type = formData.form_type;
  if (formData.is_public !== undefined) updateData.is_public = formData.is_public;
  
  // Build the SET clause
  const setEntries = Object.entries(updateData);
  const setClauses = setEntries.map((_, index) => `${setEntries[index][0]} = $${index + 1}`);
  const setClause = setClauses.join(', ');
  
  // Build the query
  const query = `
    UPDATE forms 
    SET ${setClause}
    WHERE id = $${setEntries.length + 1}
    RETURNING *
  `;
  
  // Execute the query
  const values = [...Object.values(updateData), id];
  const result = await db.query(query, values);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const form = result.rows[0];
  
  // Parse JSON fields
  try {
    form.fields = JSON.parse(form.fields);
    form.settings = JSON.parse(form.settings);
  } catch (error) {
    console.error('Error parsing form JSON fields:', error);
  }
  
  return form;
}

/**
 * Delete a form
 * @param {string} id - Form ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteForm(id) {
  const query = 'DELETE FROM forms WHERE id = $1 RETURNING id';
  const result = await db.query(query, [id]);
  return result.rows.length > 0;
}

/**
 * Submit form data
 * @param {string} formId - Form ID
 * @param {Object} submissionData - Form submission data
 * @returns {Promise<Object>} Submission result
 */
async function submitForm(formId, submissionData) {
  const id = generateId();
  const timestamp = new Date().toISOString();
  
  const submission = {
    id,
    form_id: formId,
    data: JSON.stringify(submissionData),
    created_at: timestamp,
    ip_address: submissionData.ip_address || '',
    status: 'new'
  };
  
  const query = `
    INSERT INTO form_submissions (
      id, form_id, data, created_at, ip_address, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    ) RETURNING *
  `;
  
  const values = [
    submission.id, submission.form_id, submission.data,
    submission.created_at, submission.ip_address, submission.status
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

/**
 * Get form submissions
 * @param {string} formId - Form ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Form submissions
 */
async function getFormSubmissions(formId, options = {}) {
  const { limit = 100, offset = 0 } = options;
  
  const query = `
    SELECT * FROM form_submissions 
    WHERE form_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await db.query(query, [formId, limit, offset]);
  
  // Parse JSON data
  return result.rows.map(submission => {
    try {
      submission.data = JSON.parse(submission.data);
    } catch (error) {
      console.error('Error parsing submission data:', error);
    }
    return submission;
  });
}

/**
 * Get form submission by ID
 * @param {string} id - Submission ID
 * @returns {Promise<Object>} Submission data
 */
async function getFormSubmissionById(id) {
  const query = 'SELECT * FROM form_submissions WHERE id = $1';
  const result = await db.query(query, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const submission = result.rows[0];
  
  // Parse JSON data
  try {
    submission.data = JSON.parse(submission.data);
  } catch (error) {
    console.error('Error parsing submission data:', error);
  }
  
  return submission;
}

module.exports = {
  createForm,
  getFormById,
  getFormsByUserId,
  getFormsByOrganization,
  updateForm,
  deleteForm,
  submitForm,
  getFormSubmissions,
  getFormSubmissionById
};
