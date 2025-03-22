/**
 * Workflow model
 * Represents automation workflows in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new workflow
 * @param {Object} data - Workflow data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created workflow
 */
export async function createWorkflow(data, organizationId) {
  const db = await getDB();
  const { name, trigger_type, trigger_config, steps } = data;
  
  // Generate workflow ID
  const id = generateId();
  
  // Insert workflow
  await insertRow(db, 'workflows', {
    id,
    organization_id: organizationId,
    name,
    trigger_type,
    trigger_config: trigger_config ? JSON.stringify(trigger_config) : null,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Create steps if provided
  if (steps && Array.isArray(steps) && steps.length > 0) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await insertRow(db, 'workflow_steps', {
        id: generateId(),
        workflow_id: id,
        step_type: step.step_type,
        step_config: JSON.stringify(step.step_config || {}),
        order_index: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }
  
  // Return created workflow with steps
  return getWorkflowById(id, organizationId);
}

/**
 * Get workflow by ID
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Workflow object with steps
 */
export async function getWorkflowById(id, organizationId) {
  const db = await getDB();
  
  // Get workflow
  const workflow = await getRow(
    db,
    'SELECT * FROM workflows WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!workflow) {
    throw new Error('Workflow not found');
  }
  
  // Parse trigger config
  if (workflow.trigger_config) {
    workflow.trigger_config = JSON.parse(workflow.trigger_config);
  }
  
  // Get steps
  const steps = await getRows(
    db,
    'SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY order_index',
    [id]
  );
  
  // Parse step config for each step
  workflow.steps = steps.map(step => {
    return {
      ...step,
      step_config: JSON.parse(step.step_config)
    };
  });
  
  return workflow;
}

/**
 * Get workflows by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of workflow objects with steps
 */
export async function getWorkflowsByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { 
    is_active, 
    trigger_type,
    limit = 50, 
    offset = 0 
  } = options;
  
  // Build query
  let query = 'SELECT * FROM workflows WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add filters
  if (is_active !== undefined) {
    query += ' AND is_active = ?';
    params.push(is_active ? 1 : 0);
  }
  
  if (trigger_type) {
    query += ' AND trigger_type = ?';
    params.push(trigger_type);
  }
  
  // Add sorting and pagination
  query += ' ORDER BY name LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  // Get workflows
  const workflows = await getRows(db, query, params);
  
  // Get steps for each workflow and parse configs
  for (const workflow of workflows) {
    // Parse trigger config
    if (workflow.trigger_config) {
      workflow.trigger_config = JSON.parse(workflow.trigger_config);
    }
    
    // Get steps
    const steps = await getRows(
      db,
      'SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY order_index',
      [workflow.id]
    );
    
    // Parse step config for each step
    workflow.steps = steps.map(step => {
      return {
        ...step,
        step_config: JSON.parse(step.step_config)
      };
    });
  }
  
  return workflows;
}

/**
 * Update workflow
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Workflow data to update
 * @returns {Promise<Object>} Updated workflow
 */
export async function updateWorkflow(id, organizationId, data) {
  const db = await getDB();
  
  // Check if workflow exists
  const workflow = await getWorkflowById(id, organizationId);
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : workflow.name,
    trigger_type: data.trigger_type !== undefined ? data.trigger_type : workflow.trigger_type,
    trigger_config: data.trigger_config !== undefined 
      ? JSON.stringify(data.trigger_config) 
      : workflow.trigger_config ? JSON.stringify(workflow.trigger_config) : null,
    is_active: data.is_active !== undefined ? data.is_active : workflow.is_active,
    updated_at: new Date().toISOString()
  };
  
  // Update workflow
  await updateRow(db, 'workflows', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Update steps if provided
  if (data.steps && Array.isArray(data.steps)) {
    // Delete existing steps
    await deleteRow(db, 'workflow_steps', 'workflow_id = ?', [id]);
    
    // Create new steps
    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      await insertRow(db, 'workflow_steps', {
        id: generateId(),
        workflow_id: id,
        step_type: step.step_type,
        step_config: JSON.stringify(step.step_config || {}),
        order_index: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }
  
  // Return updated workflow
  return getWorkflowById(id, organizationId);
}

/**
 * Delete workflow
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteWorkflow(id, organizationId) {
  const db = await getDB();
  
  // Check if workflow exists
  await getWorkflowById(id, organizationId);
  
  // Delete workflow steps first (cascade)
  await deleteRow(db, 'workflow_steps', 'workflow_id = ?', [id]);
  
  // Delete workflow
  await deleteRow(db, 'workflows', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Activate workflow
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated workflow
 */
export async function activateWorkflow(id, organizationId) {
  const db = await getDB();
  
  // Check if workflow exists
  await getWorkflowById(id, organizationId);
  
  // Update workflow
  await updateRow(
    db,
    'workflows',
    {
      is_active: true,
      updated_at: new Date().toISOString()
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated workflow
  return getWorkflowById(id, organizationId);
}

/**
 * Deactivate workflow
 * @param {string} id - Workflow ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated workflow
 */
export async function deactivateWorkflow(id, organizationId) {
  const db = await getDB();
  
  // Check if workflow exists
  await getWorkflowById(id, organizationId);
  
  // Update workflow
  await updateRow(
    db,
    'workflows',
    {
      is_active: false,
      updated_at: new Date().toISOString()
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated workflow
  return getWorkflowById(id, organizationId);
}

/**
 * Get workflows by trigger type
 * @param {string} triggerType - Trigger type
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of workflow objects
 */
export async function getWorkflowsByTriggerType(triggerType, organizationId) {
  const db = await getDB();
  
  return getWorkflowsByOrganization(organizationId, { 
    trigger_type: triggerType,
    is_active: true
  });
}
