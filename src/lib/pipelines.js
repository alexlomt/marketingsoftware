// Pipeline management utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new pipeline
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} name - Pipeline name
 * @returns {Promise<Object>} Pipeline object
 */
export async function createPipeline(db, organizationId, name) {
  // Generate pipeline ID
  const id = generateId();
  
  // Insert pipeline
  await insertRow(db, 'pipelines', {
    id,
    organization_id: organizationId,
    name,
  });
  
  // Return pipeline
  return {
    id,
    organization_id: organizationId,
    name,
  };
}

/**
 * Get pipeline by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Pipeline object
 */
export async function getPipelineById(db, id, organizationId) {
  const pipeline = await getRow(
    db,
    'SELECT * FROM pipelines WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!pipeline) {
    throw new Error('Pipeline not found');
  }
  
  return pipeline;
}

/**
 * Get pipelines for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of pipeline objects
 */
export async function getOrganizationPipelines(db, organizationId) {
  return getRows(
    db,
    'SELECT * FROM pipelines WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
}

/**
 * Update pipeline
 * @param {D1Database} db - D1 database client
 * @param {string} id - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {string} name - New pipeline name
 * @returns {Promise<Object>} Updated pipeline object
 */
export async function updatePipeline(db, id, organizationId, name) {
  // Check if pipeline exists
  const pipeline = await getPipelineById(db, id, organizationId);
  
  // Update pipeline
  await updateRow(
    db,
    'pipelines',
    { name, updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated pipeline
  return {
    ...pipeline,
    name,
  };
}

/**
 * Delete pipeline
 * @param {D1Database} db - D1 database client
 * @param {string} id - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deletePipeline(db, id, organizationId) {
  // Check if pipeline exists
  await getPipelineById(db, id, organizationId);
  
  // Delete pipeline
  await deleteRow(db, 'pipelines', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Create a pipeline stage
 * @param {D1Database} db - D1 database client
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {string} name - Stage name
 * @param {number} orderIndex - Stage order index
 * @returns {Promise<Object>} Pipeline stage object
 */
export async function createPipelineStage(db, pipelineId, organizationId, name, orderIndex) {
  // Check if pipeline exists and belongs to organization
  await getPipelineById(db, pipelineId, organizationId);
  
  // Generate stage ID
  const id = generateId();
  
  // Insert stage
  await insertRow(db, 'pipeline_stages', {
    id,
    pipeline_id: pipelineId,
    name,
    order_index: orderIndex,
  });
  
  // Return stage
  return {
    id,
    pipeline_id: pipelineId,
    name,
    order_index: orderIndex,
  };
}

/**
 * Get pipeline stages
 * @param {D1Database} db - D1 database client
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of pipeline stage objects
 */
export async function getPipelineStages(db, pipelineId, organizationId) {
  // Check if pipeline exists and belongs to organization
  await getPipelineById(db, pipelineId, organizationId);
  
  // Get stages
  return getRows(
    db,
    'SELECT * FROM pipeline_stages WHERE pipeline_id = ? ORDER BY order_index',
    [pipelineId]
  );
}

/**
 * Update pipeline stage
 * @param {D1Database} db - D1 database client
 * @param {string} id - Stage ID
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Stage data to update
 * @returns {Promise<Object>} Updated pipeline stage object
 */
export async function updatePipelineStage(db, id, pipelineId, organizationId, data) {
  // Check if pipeline exists and belongs to organization
  await getPipelineById(db, pipelineId, organizationId);
  
  // Check if stage exists
  const stage = await getRow(
    db,
    'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
    [id, pipelineId]
  );
  
  if (!stage) {
    throw new Error('Pipeline stage not found');
  }
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : stage.name,
    order_index: data.order_index !== undefined ? data.order_index : stage.order_index,
    updated_at: new Date().toISOString(),
  };
  
  // Update stage
  await updateRow(db, 'pipeline_stages', updateData, 'id = ?', [id]);
  
  // Return updated stage
  return {
    ...stage,
    ...updateData,
  };
}

/**
 * Delete pipeline stage
 * @param {D1Database} db - D1 database client
 * @param {string} id - Stage ID
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deletePipelineStage(db, id, pipelineId, organizationId) {
  // Check if pipeline exists and belongs to organization
  await getPipelineById(db, pipelineId, organizationId);
  
  // Check if stage exists
  const stage = await getRow(
    db,
    'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
    [id, pipelineId]
  );
  
  if (!stage) {
    throw new Error('Pipeline stage not found');
  }
  
  // Delete stage
  await deleteRow(db, 'pipeline_stages', 'id = ?', [id]);
}

/**
 * Create a deal
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} dealData - Deal data
 * @returns {Promise<Object>} Deal object
 */
export async function createDeal(db, organizationId, dealData) {
  const { pipeline_id, stage_id, contact_id, title, value, currency, expected_close_date } = dealData;
  
  // Check if pipeline exists and belongs to organization
  await getPipelineById(db, pipeline_id, organizationId);
  
  // Check if stage exists and belongs to pipeline
  const stage = await getRow(
    db,
    'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
    [stage_id, pipeline_id]
  );
  
  if (!stage) {
    throw new Error('Pipeline stage not found');
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
    value: value || null,
    currency: currency || 'USD',
    expected_close_date: expected_close_date || null,
  });
  
  // Return deal
  return {
    id,
    organization_id: organizationId,
    pipeline_id,
    stage_id,
    contact_id: contact_id || null,
    title,
    value: value || null,
    currency: currency || 'USD',
    expected_close_date: expected_close_date || null,
  };
}

/**
 * Get deal by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Deal ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Deal object
 */
export async function getDealById(db, id, organizationId) {
  const deal = await getRow(
    db,
    'SELECT * FROM deals WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!deal) {
    throw new Error('Deal not found');
  }
  
  return deal;
}

/**
 * Get deals for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of deal objects
 */
export async function getOrganizationDeals(db, organizationId, options = {}) {
  const { pipeline_id, stage_id, contact_id, limit = 50, offset = 0 } = options;
  
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
  
  // Add pagination
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return getRows(db, query, params);
}

/**
 * Update deal
 * @param {D1Database} db - D1 database client
 * @param {string} id - Deal ID
 * @param {string} organizationId - Organization ID
 * @param {Object} dealData - Deal data to update
 * @returns {Promise<Object>} Updated deal object
 */
export async function updateDeal(db, id, organizationId, dealData) {
  // Check if deal exists
  const deal = await getDealById(db, id, organizationId);
  
  // If changing pipeline or stage, validate they exist
  if (dealData.pipeline_id && dealData.pipeline_id !== deal.pipeline_id) {
    await getPipelineById(db, dealData.pipeline_id, organizationId);
  }
  
  if (dealData.stage_id) {
    const pipelineId = dealData.pipeline_id || deal.pipeline_id;
    const stage = await getRow(
      db,
      'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
      [dealData.stage_id, pipelineId]
    );
    
    if (!stage) {
      throw new Error('Pipeline stage not found');
    }
  }
  
  // Prepare update data
  const updateData = {
    pipeline_id: dealData.pipeline_id !== undefined ? dealData.pipeline_id : deal.pipeline_id,
    stage_id: dealData.stage_id !== undefined ? dealData.stage_id : deal.stage_id,
    contact_id: dealData.contact_id !== undefined ? dealData.contact_id : deal.contact_id,
    title: dealData.title !== undefined ? dealData.title : deal.title,
    value: dealData.value !== undefined ? dealData.value : deal.value,
    currency: dealData.currency !== undefined ? dealData.currency : deal.currency,
    expected_close_date: dealData.expected_close_date !== undefined ? dealData.expected_close_date : deal.expected_close_date,
    updated_at: new Date().toISOString(),
  };
  
  // Update deal
  await updateRow(db, 'deals', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated deal
  return {
    ...deal,
    ...updateData,
  };
}

/**
 * Delete deal
 * @param {D1Database} db - D1 database client
 * @param {string} id - Deal ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteDeal(db, id, organizationId) {
  // Check if deal exists
  await getDealById(db, id, organizationId);
  
  // Delete deal
  await deleteRow(db, 'deals', 'id = ? AND organization_id = ?', [id, organizationId]);
}
