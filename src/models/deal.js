/**
 * Deal model
 * Represents sales deals in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new deal
 * @param {Object} data - Deal data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created deal
 */
export async function createDeal(data, organizationId) {
  const db = await getDB();
  const { 
    pipeline_id, 
    stage_id, 
    contact_id, 
    title, 
    value, 
    currency, 
    expected_close_date,
    description,
    status
  } = data;
  
  // Check if pipeline exists and belongs to organization
  const pipelineQuery = 'SELECT * FROM pipelines WHERE id = ? AND organization_id = ?';
  const pipeline = await getRow(db, pipelineQuery, [pipeline_id, organizationId]);
  
  if (!pipeline) {
    throw new Error('Pipeline not found');
  }
  
  // Check if stage exists and belongs to pipeline
  const stageQuery = 'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?';
  const stage = await getRow(db, stageQuery, [stage_id, pipeline_id]);
  
  if (!stage) {
    throw new Error('Pipeline stage not found');
  }
  
  // If contact_id is provided, check if contact exists and belongs to organization
  if (contact_id) {
    const contactQuery = 'SELECT * FROM contacts WHERE id = ? AND organization_id = ?';
    const contact = await getRow(db, contactQuery, [contact_id, organizationId]);
    
    if (!contact) {
      throw new Error('Contact not found');
    }
  }
  
  // Generate deal ID
  const id = generateId();
  
  // Insert deal
  await insertRow(db, 'deals', {
    id,
    organization_id: organizationId,
    pipeline_id,
    stage_id,
    contact_id: contact_id || null,
    title,
    description: description || null,
    value: value || null,
    currency: currency || 'USD',
    expected_close_date: expected_close_date || null,
    status: status || 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created deal
  return getDealById(id, organizationId);
}

/**
 * Get deal by ID
 * @param {string} id - Deal ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Deal object
 */
export async function getDealById(id, organizationId) {
  const db = await getDB();
  
  // Get deal
  const dealQuery = 'SELECT * FROM deals WHERE id = ? AND organization_id = ?';
  const deal = await getRow(db, dealQuery, [id, organizationId]);
  
  if (!deal) {
    throw new Error('Deal not found');
  }
  
  // Get stage and pipeline info
  const stageQuery = 'SELECT * FROM pipeline_stages WHERE id = ?';
  deal.stage = await getRow(db, stageQuery, [deal.stage_id]);
  
  const pipelineQuery = 'SELECT * FROM pipelines WHERE id = ?';
  deal.pipeline = await getRow(db, pipelineQuery, [deal.pipeline_id]);
  
  // Get contact info if available
  if (deal.contact_id) {
    const contactQuery = 'SELECT id, first_name, last_name, email, phone FROM contacts WHERE id = ?';
    deal.contact = await getRow(db, contactQuery, [deal.contact_id]);
  }
  
  return deal;
}

/**
 * Get deals by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of deal objects
 */
export async function getDealsByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { 
    pipeline_id, 
    stage_id, 
    contact_id, 
    status,
    limit = 50, 
    offset = 0,
    sort_by = 'created_at',
    sort_dir = 'desc'
  } = options;
  
  // Build query
  let query = 'SELECT * FROM deals WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add filters
  if (pipeline_id) {
    query += ' AND pipeline_id = ?';
    params.push(pipeline_id);
  }
  
  if (stage_id) {
    query += ' AND stage_id = ?';
    params.push(stage_id);
  }
  
  if (contact_id) {
    query += ' AND contact_id = ?';
    params.push(contact_id);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  // Add sorting
  query += ` ORDER BY ${sort_by} ${sort_dir === 'asc' ? 'ASC' : 'DESC'}`;
  
  // Add pagination
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  // Get deals
  const deals = await getRows(db, query, params);
  
  // Get additional info for each deal
  for (const deal of deals) {
    // Get stage info
    const stageQuery = 'SELECT * FROM pipeline_stages WHERE id = ?';
    deal.stage = await getRow(db, stageQuery, [deal.stage_id]);
    
    // Get pipeline info
    const pipelineQuery = 'SELECT * FROM pipelines WHERE id = ?';
    deal.pipeline = await getRow(db, pipelineQuery, [deal.pipeline_id]);
    
    // Get contact info if available
    if (deal.contact_id) {
      const contactQuery = 'SELECT id, first_name, last_name, email, phone FROM contacts WHERE id = ?';
      deal.contact = await getRow(db, contactQuery, [deal.contact_id]);
    }
  }
  
  return deals;
}

/**
 * Update deal
 * @param {string} id - Deal ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Deal data to update
 * @returns {Promise<Object>} Updated deal
 */
export async function updateDeal(id, organizationId, data) {
  const db = await getDB();
  
  // Check if deal exists
  const deal = await getDealById(id, organizationId);
  
  // If changing pipeline or stage, validate they exist
  if (data.pipeline_id && data.pipeline_id !== deal.pipeline_id) {
    const pipelineQuery = 'SELECT * FROM pipelines WHERE id = ? AND organization_id = ?';
    const pipeline = await getRow(db, pipelineQuery, [data.pipeline_id, organizationId]);
    
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }
  }
  
  if (data.stage_id) {
    const pipelineId = data.pipeline_id || deal.pipeline_id;
    const stageQuery = 'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?';
    const stage = await getRow(db, stageQuery, [data.stage_id, pipelineId]);
    
    if (!stage) {
      throw new Error('Pipeline stage not found');
    }
  }
  
  // If changing contact, validate it exists
  if (data.contact_id && data.contact_id !== deal.contact_id) {
    const contactQuery = 'SELECT * FROM contacts WHERE id = ? AND organization_id = ?';
    const contact = await getRow(db, contactQuery, [data.contact_id, organizationId]);
    
    if (!contact) {
      throw new Error('Contact not found');
    }
  }
  
  // Prepare update data
  const updateData = {
    pipeline_id: data.pipeline_id !== undefined ? data.pipeline_id : deal.pipeline_id,
    stage_id: data.stage_id !== undefined ? data.stage_id : deal.stage_id,
    contact_id: data.contact_id !== undefined ? data.contact_id : deal.contact_id,
    title: data.title !== undefined ? data.title : deal.title,
    description: data.description !== undefined ? data.description : deal.description,
    value: data.value !== undefined ? data.value : deal.value,
    currency: data.currency !== undefined ? data.currency : deal.currency,
    expected_close_date: data.expected_close_date !== undefined ? data.expected_close_date : deal.expected_close_date,
    status: data.status !== undefined ? data.status : deal.status,
    updated_at: new Date().toISOString()
  };
  
  // Update deal
  await updateRow(db, 'deals', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated deal
  return getDealById(id, organizationId);
}

/**
 * Delete deal
 * @param {string} id - Deal ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteDeal(id, organizationId) {
  const db = await getDB();
  
  // Check if deal exists
  await getDealById(id, organizationId);
  
  // Delete deal
  await deleteRow(db, 'deals', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Get deal count by organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<number>} Deal count
 */
export async function getDealCount(organizationId) {
  const db = await getDB();
  
  const result = await getRow(
    db, 
    'SELECT COUNT(*) as count FROM deals WHERE organization_id = ?', 
    [organizationId]
  );
  
  return result.count;
}

/**
 * Get deal value sum by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<number>} Deal value sum
 */
export async function getDealValueSum(organizationId, options = {}) {
  const db = await getDB();
  const { pipeline_id, stage_id, status } = options;
  
  let query = 'SELECT SUM(value) as total FROM deals WHERE organization_id = ?';
  const params = [organizationId];
  
  if (pipeline_id) {
    query += ' AND pipeline_id = ?';
    params.push(pipeline_id);
  }
  
  if (stage_id) {
    query += ' AND stage_id = ?';
    params.push(stage_id);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  const result = await getRow(db, query, params);
  
  return result.total || 0;
}
