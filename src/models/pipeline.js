/**
 * Pipeline model
 * Represents sales pipelines in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new pipeline
 * @param {Object} data - Pipeline data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created pipeline
 */
export async function createPipeline(data, organizationId) {
  const db = await getDB();
  const { name, description, stages } = data;
  
  // Check if pipeline with same name already exists
  const existingPipeline = await getRow(
    db,
    'SELECT * FROM pipelines WHERE name = ? AND organization_id = ?',
    [name, organizationId]
  );
  
  if (existingPipeline) {
    throw new Error('Pipeline with this name already exists');
  }
  
  // Generate pipeline ID
  const id = generateId();
  
  // Insert pipeline
  await insertRow(db, 'pipelines', {
    id,
    organization_id: organizationId,
    name,
    description: description || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Create stages if provided
  if (stages && Array.isArray(stages) && stages.length > 0) {
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      await insertRow(db, 'pipeline_stages', {
        id: generateId(),
        pipeline_id: id,
        name: stage.name,
        description: stage.description || null,
        order_index: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }
  
  // Return created pipeline with stages
  return getPipelineById(id, organizationId);
}

/**
 * Get pipeline by ID
 * @param {string} id - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Pipeline object with stages
 */
export async function getPipelineById(id, organizationId) {
  const db = await getDB();
  
  // Get pipeline
  const pipeline = await getRow(
    db,
    'SELECT * FROM pipelines WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!pipeline) {
    throw new Error('Pipeline not found');
  }
  
  // Get stages
  pipeline.stages = await getRows(
    db,
    'SELECT * FROM pipeline_stages WHERE pipeline_id = ? ORDER BY order_index',
    [id]
  );
  
  return pipeline;
}

/**
 * Get pipelines by organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of pipeline objects with stages
 */
export async function getPipelinesByOrganization(organizationId) {
  const db = await getDB();
  
  // Get pipelines
  const pipelines = await getRows(
    db,
    'SELECT * FROM pipelines WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
  
  // Get stages for each pipeline
  for (const pipeline of pipelines) {
    pipeline.stages = await getRows(
      db,
      'SELECT * FROM pipeline_stages WHERE pipeline_id = ? ORDER BY order_index',
      [pipeline.id]
    );
  }
  
  return pipelines;
}

/**
 * Update pipeline
 * @param {string} id - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Pipeline data to update
 * @returns {Promise<Object>} Updated pipeline
 */
export async function updatePipeline(id, organizationId, data) {
  const db = await getDB();
  
  // Check if pipeline exists
  const pipeline = await getPipelineById(id, organizationId);
  
  // If changing name, check if new name already exists
  if (data.name && data.name !== pipeline.name) {
    const existingPipeline = await getRow(
      db,
      'SELECT * FROM pipelines WHERE name = ? AND organization_id = ? AND id != ?',
      [data.name, organizationId, id]
    );
    
    if (existingPipeline) {
      throw new Error('Pipeline with this name already exists');
    }
  }
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : pipeline.name,
    description: data.description !== undefined ? data.description : pipeline.description,
    updated_at: new Date().toISOString()
  };
  
  // Update pipeline
  await updateRow(db, 'pipelines', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated pipeline
  return getPipelineById(id, organizationId);
}

/**
 * Delete pipeline
 * @param {string} id - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deletePipeline(id, organizationId) {
  const db = await getDB();
  
  // Check if pipeline exists
  await getPipelineById(id, organizationId);
  
  // Delete pipeline stages first (cascade)
  await deleteRow(db, 'pipeline_stages', 'pipeline_id = ?', [id]);
  
  // Delete pipeline
  await deleteRow(db, 'pipelines', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Create pipeline stage
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Stage data
 * @returns {Promise<Object>} Created stage
 */
export async function createPipelineStage(pipelineId, organizationId, data) {
  const db = await getDB();
  
  // Check if pipeline exists and belongs to organization
  await getPipelineById(pipelineId, organizationId);
  
  // Get highest order index
  const maxOrderResult = await getRow(
    db,
    'SELECT MAX(order_index) as max_order FROM pipeline_stages WHERE pipeline_id = ?',
    [pipelineId]
  );
  
  const orderIndex = maxOrderResult && maxOrderResult.max_order !== null 
    ? maxOrderResult.max_order + 1 
    : 0;
  
  // Generate stage ID
  const id = generateId();
  
  // Insert stage
  await insertRow(db, 'pipeline_stages', {
    id,
    pipeline_id: pipelineId,
    name: data.name,
    description: data.description || null,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created stage
  return getRow(db, 'SELECT * FROM pipeline_stages WHERE id = ?', [id]);
}

/**
 * Update pipeline stage
 * @param {string} id - Stage ID
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Stage data to update
 * @returns {Promise<Object>} Updated stage
 */
export async function updatePipelineStage(id, pipelineId, organizationId, data) {
  const db = await getDB();
  
  // Check if pipeline exists and belongs to organization
  await getPipelineById(pipelineId, organizationId);
  
  // Check if stage exists and belongs to pipeline
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
    description: data.description !== undefined ? data.description : stage.description,
    updated_at: new Date().toISOString()
  };
  
  // Update stage
  await updateRow(db, 'pipeline_stages', updateData, 'id = ?', [id]);
  
  // Return updated stage
  return getRow(db, 'SELECT * FROM pipeline_stages WHERE id = ?', [id]);
}

/**
 * Delete pipeline stage
 * @param {string} id - Stage ID
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deletePipelineStage(id, pipelineId, organizationId) {
  const db = await getDB();
  
  // Check if pipeline exists and belongs to organization
  await getPipelineById(pipelineId, organizationId);
  
  // Check if stage exists and belongs to pipeline
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
  
  // Reorder remaining stages
  const remainingStages = await getRows(
    db,
    'SELECT * FROM pipeline_stages WHERE pipeline_id = ? ORDER BY order_index',
    [pipelineId]
  );
  
  for (let i = 0; i < remainingStages.length; i++) {
    await updateRow(
      db, 
      'pipeline_stages', 
      { order_index: i }, 
      'id = ?', 
      [remainingStages[i].id]
    );
  }
}

/**
 * Reorder pipeline stages
 * @param {string} pipelineId - Pipeline ID
 * @param {string} organizationId - Organization ID
 * @param {Array} stageIds - Ordered array of stage IDs
 * @returns {Promise<Array>} Updated stages
 */
export async function reorderPipelineStages(pipelineId, organizationId, stageIds) {
  const db = await getDB();
  
  // Check if pipeline exists and belongs to organization
  await getPipelineById(pipelineId, organizationId);
  
  // Check if all stages exist and belong to pipeline
  for (const stageId of stageIds) {
    const stage = await getRow(
      db,
      'SELECT * FROM pipeline_stages WHERE id = ? AND pipeline_id = ?',
      [stageId, pipelineId]
    );
    
    if (!stage) {
      throw new Error(`Pipeline stage ${stageId} not found`);
    }
  }
  
  // Update order for each stage
  for (let i = 0; i < stageIds.length; i++) {
    await updateRow(
      db, 
      'pipeline_stages', 
      { 
        order_index: i,
        updated_at: new Date().toISOString()
      }, 
      'id = ?', 
      [stageIds[i]]
    );
  }
  
  // Return updated stages
  return getRows(
    db,
    'SELECT * FROM pipeline_stages WHERE pipeline_id = ? ORDER BY order_index',
    [pipelineId]
  );
}
