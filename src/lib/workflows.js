// Workflow automation utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new workflow
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} name - Workflow name
 * @param {string} triggerType - Trigger type
 * @param {Object} triggerConfig - Trigger configuration
 * @returns {Promise<Object>} Workflow object
 */
export async function createWorkflow(db, organizationId, name, triggerType, triggerConfig = {}) {
  // Generate workflow ID
  const id = generateId();
  
  // Insert workflow
  await insertRow(db, 'workflows', {
    id,
    organization_id: organizationId,
    name,
    trigger_type: triggerType,
    trigger_config: JSON.stringify(triggerConfig),
    is_active: false,
  });
  
  // Return workflow
  return {
    id,
    organization_id: organizationId,
    name,
    trigger_type: triggerType,
    trigger_config: triggerConfig,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get workflow by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Workflow object
 */
export async function getWorkflowById(db, id, organizationId) {
  const workflow = await getRow(
    db,
    'SELECT * FROM workflows WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!workflow) {
    throw new Error('Workflow not found');
  }
  
  // Parse trigger configuration
  return {
    ...workflow,
    trigger_config: JSON.parse(workflow.trigger_config),
  };
}

/**
 * Get workflows for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of workflow objects
 */
export async function getOrganizationWorkflows(db, organizationId) {
  const workflows = await getRows(
    db,
    'SELECT * FROM workflows WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
  
  // Parse trigger configuration
  return workflows.map(workflow => ({
    ...workflow,
    trigger_config: JSON.parse(workflow.trigger_config),
  }));
}

/**
 * Update workflow
 * @param {D1Database} db - D1 database client
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @param {Object} workflowData - Workflow data to update
 * @returns {Promise<Object>} Updated workflow object
 */
export async function updateWorkflow(db, id, organizationId, workflowData) {
  // Check if workflow exists
  const workflow = await getWorkflowById(db, id, organizationId);
  
  // Prepare update data
  const updateData = {
    name: workflowData.name !== undefined ? workflowData.name : workflow.name,
    trigger_type: workflowData.trigger_type !== undefined ? workflowData.trigger_type : workflow.trigger_type,
    trigger_config: workflowData.trigger_config !== undefined 
      ? JSON.stringify(workflowData.trigger_config) 
      : JSON.stringify(workflow.trigger_config),
    updated_at: new Date().toISOString(),
  };
  
  // Update workflow
  await updateRow(db, 'workflows', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated workflow
  return {
    ...workflow,
    name: updateData.name,
    trigger_type: updateData.trigger_type,
    trigger_config: workflowData.trigger_config !== undefined 
      ? workflowData.trigger_config 
      : workflow.trigger_config,
    updated_at: updateData.updated_at,
  };
}

/**
 * Delete workflow
 * @param {D1Database} db - D1 database client
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteWorkflow(db, id, organizationId) {
  // Check if workflow exists
  await getWorkflowById(db, id, organizationId);
  
  // Delete workflow
  await deleteRow(db, 'workflows', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Activate workflow
 * @param {D1Database} db - D1 database client
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated workflow object
 */
export async function activateWorkflow(db, id, organizationId) {
  // Check if workflow exists
  const workflow = await getWorkflowById(db, id, organizationId);
  
  // Update workflow
  await updateRow(
    db,
    'workflows',
    { is_active: true, updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated workflow
  return {
    ...workflow,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Deactivate workflow
 * @param {D1Database} db - D1 database client
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated workflow object
 */
export async function deactivateWorkflow(db, id, organizationId) {
  // Check if workflow exists
  const workflow = await getWorkflowById(db, id, organizationId);
  
  // Update workflow
  await updateRow(
    db,
    'workflows',
    { is_active: false, updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated workflow
  return {
    ...workflow,
    is_active: false,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create a workflow step
 * @param {D1Database} db - D1 database client
 * @param {string} workflowId - Workflow ID
 * @param {string} organizationId - Organization ID
 * @param {string} stepType - Step type
 * @param {Object} stepConfig - Step configuration
 * @param {number} orderIndex - Step order index
 * @returns {Promise<Object>} Workflow step object
 */
export async function createWorkflowStep(db, workflowId, organizationId, stepType, stepConfig, orderIndex) {
  // Check if workflow exists and belongs to organization
  await getWorkflowById(db, workflowId, organizationId);
  
  // Generate step ID
  const id = generateId();
  
  // Insert step
  await insertRow(db, 'workflow_steps', {
    id,
    workflow_id: workflowId,
    step_type: stepType,
    step_config: JSON.stringify(stepConfig),
    order_index: orderIndex,
  });
  
  // Return step
  return {
    id,
    workflow_id: workflowId,
    step_type: stepType,
    step_config: stepConfig,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get workflow steps
 * @param {D1Database} db - D1 database client
 * @param {string} workflowId - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of workflow step objects
 */
export async function getWorkflowSteps(db, workflowId, organizationId) {
  // Check if workflow exists and belongs to organization
  await getWorkflowById(db, workflowId, organizationId);
  
  // Get steps
  const steps = await getRows(
    db,
    'SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY order_index',
    [workflowId]
  );
  
  // Parse step configuration
  return steps.map(step => ({
    ...step,
    step_config: JSON.parse(step.step_config),
  }));
}

/**
 * Update workflow step
 * @param {D1Database} db - D1 database client
 * @param {string} id - Step ID
 * @param {string} workflowId - Workflow ID
 * @param {string} organizationId - Organization ID
 * @param {Object} stepData - Step data to update
 * @returns {Promise<Object>} Updated workflow step object
 */
export async function updateWorkflowStep(db, id, workflowId, organizationId, stepData) {
  // Check if workflow exists and belongs to organization
  await getWorkflowById(db, workflowId, organizationId);
  
  // Check if step exists
  const step = await getRow(
    db,
    'SELECT * FROM workflow_steps WHERE id = ? AND workflow_id = ?',
    [id, workflowId]
  );
  
  if (!step) {
    throw new Error('Workflow step not found');
  }
  
  // Parse step configuration
  const parsedStep = {
    ...step,
    step_config: JSON.parse(step.step_config),
  };
  
  // Prepare update data
  const updateData = {
    step_type: stepData.step_type !== undefined ? stepData.step_type : parsedStep.step_type,
    step_config: stepData.step_config !== undefined 
      ? JSON.stringify(stepData.step_config) 
      : JSON.stringify(parsedStep.step_config),
    order_index: stepData.order_index !== undefined ? stepData.order_index : parsedStep.order_index,
    updated_at: new Date().toISOString(),
  };
  
  // Update step
  await updateRow(db, 'workflow_steps', updateData, 'id = ?', [id]);
  
  // Return updated step
  return {
    ...parsedStep,
    step_type: updateData.step_type,
    step_config: stepData.step_config !== undefined ? stepData.step_config : parsedStep.step_config,
    order_index: updateData.order_index,
    updated_at: updateData.updated_at,
  };
}

/**
 * Delete workflow step
 * @param {D1Database} db - D1 database client
 * @param {string} id - Step ID
 * @param {string} workflowId - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteWorkflowStep(db, id, workflowId, organizationId) {
  // Check if workflow exists and belongs to organization
  await getWorkflowById(db, workflowId, organizationId);
  
  // Check if step exists
  const step = await getRow(
    db,
    'SELECT * FROM workflow_steps WHERE id = ? AND workflow_id = ?',
    [id, workflowId]
  );
  
  if (!step) {
    throw new Error('Workflow step not found');
  }
  
  // Delete step
  await deleteRow(db, 'workflow_steps', 'id = ?', [id]);
}
