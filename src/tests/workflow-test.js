// Test for workflow automation functionality

import { initTestDB, createTestUser, createTestOrganization, createTestContact, cleanupTestData } from '../lib/test-utils';
import { createWorkflow, getWorkflowById, getOrganizationWorkflows, updateWorkflow, deleteWorkflow, activateWorkflow, deactivateWorkflow, createWorkflowStep, getWorkflowSteps, updateWorkflowStep, deleteWorkflowStep } from '../lib/workflows';

/**
 * Test workflow automation functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testWorkflows(env) {
  console.log('Testing workflow automation functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user, organization, and contact
    console.log('Creating test user, organization, and contact...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    const contact = await createTestContact(db, organization.id);
    
    // Test create workflow
    console.log('Testing create workflow...');
    const workflowData = {
      name: 'New Contact Workflow',
      triggerType: 'contact_created',
      triggerConfig: {}
    };
    
    const workflow = await createWorkflow(
      db, 
      organization.id, 
      workflowData.name, 
      workflowData.triggerType, 
      workflowData.triggerConfig
    );
    console.log('Workflow created successfully:', workflow);
    
    if (!workflow.id || workflow.name !== workflowData.name || workflow.trigger_type !== workflowData.triggerType) {
      throw new Error('Create workflow failed: Invalid workflow data');
    }
    
    // Test get workflow by ID
    console.log('Testing get workflow by ID...');
    const retrievedWorkflow = await getWorkflowById(db, workflow.id, organization.id);
    console.log('Workflow retrieved successfully:', retrievedWorkflow);
    
    if (retrievedWorkflow.id !== workflow.id || retrievedWorkflow.name !== workflowData.name) {
      throw new Error('Get workflow by ID failed: Invalid workflow data');
    }
    
    // Test get organization workflows
    console.log('Testing get organization workflows...');
    const workflows = await getOrganizationWorkflows(db, organization.id);
    console.log('Organization workflows retrieved successfully:', workflows);
    
    if (workflows.length !== 1 || workflows[0].id !== workflow.id) {
      throw new Error('Get organization workflows failed: Workflow not found');
    }
    
    // Test update workflow
    console.log('Testing update workflow...');
    const updatedWorkflowData = {
      name: 'Updated Contact Workflow',
      trigger_type: 'contact_created',
      trigger_config: { tags: ['new'] }
    };
    
    const updatedWorkflow = await updateWorkflow(
      db, 
      workflow.id, 
      organization.id, 
      updatedWorkflowData
    );
    console.log('Workflow updated successfully:', updatedWorkflow);
    
    if (updatedWorkflow.name !== updatedWorkflowData.name) {
      throw new Error('Update workflow failed: Workflow not updated correctly');
    }
    
    // Test create workflow step
    console.log('Testing create workflow step...');
    const stepData = {
      stepType: 'add_tag',
      stepConfig: { tag_name: 'Welcome' },
      orderIndex: 0
    };
    
    const step = await createWorkflowStep(
      db, 
      workflow.id, 
      organization.id, 
      stepData.stepType, 
      stepData.stepConfig, 
      stepData.orderIndex
    );
    console.log('Workflow step created successfully:', step);
    
    if (!step.id || step.step_type !== stepData.stepType || step.order_index !== stepData.orderIndex) {
      throw new Error('Create workflow step failed: Invalid step data');
    }
    
    // Create additional steps for testing
    await createWorkflowStep(
      db, 
      workflow.id, 
      organization.id, 
      'send_email', 
      { 
        subject: 'Welcome to our service', 
        content: 'Thank you for signing up!' 
      }, 
      1
    );
    
    await createWorkflowStep(
      db, 
      workflow.id, 
      organization.id, 
      'wait', 
      { 
        duration: 86400 // 1 day in seconds
      }, 
      2
    );
    
    // Test get workflow steps
    console.log('Testing get workflow steps...');
    const steps = await getWorkflowSteps(db, workflow.id, organization.id);
    console.log('Workflow steps retrieved successfully:', steps);
    
    if (steps.length !== 3) {
      throw new Error('Get workflow steps failed: Incorrect number of steps');
    }
    
    // Test update workflow step
    console.log('Testing update workflow step...');
    const updatedStepData = {
      step_type: 'add_tag',
      step_config: { tag_name: 'VIP' },
      order_index: 0
    };
    
    const updatedStep = await updateWorkflowStep(
      db, 
      step.id, 
      workflow.id, 
      organization.id, 
      updatedStepData
    );
    console.log('Workflow step updated successfully:', updatedStep);
    
    if (updatedStep.step_config.tag_name !== updatedStepData.step_config.tag_name) {
      throw new Error('Update workflow step failed: Step not updated correctly');
    }
    
    // Test activate workflow
    console.log('Testing activate workflow...');
    const activatedWorkflow = await activateWorkflow(db, workflow.id, organization.id);
    console.log('Workflow activated successfully:', activatedWorkflow);
    
    if (!activatedWorkflow.is_active) {
      throw new Error('Activate workflow failed: Workflow not activated');
    }
    
    // Test deactivate workflow
    console.log('Testing deactivate workflow...');
    const deactivatedWorkflow = await deactivateWorkflow(db, workflow.id, organization.id);
    console.log('Workflow deactivated successfully:', deactivatedWorkflow);
    
    if (deactivatedWorkflow.is_active) {
      throw new Error('Deactivate workflow failed: Workflow still active');
    }
    
    // Test delete workflow step
    console.log('Testing delete workflow step...');
    await deleteWorkflowStep(db, step.id, workflow.id, organization.id);
    
    // Verify step was deleted
    const stepsAfterDeletion = await getWorkflowSteps(db, workflow.id, organization.id);
    console.log('Workflow steps after deletion:', stepsAfterDeletion);
    
    if (stepsAfterDeletion.length !== 2) {
      throw new Error('Delete workflow step failed: Step not deleted');
    }
    
    // Test delete workflow
    console.log('Testing delete workflow...');
    await deleteWorkflow(db, workflow.id, organization.id);
    
    // Verify workflow was deleted
    try {
      await getWorkflowById(db, workflow.id, organization.id);
      throw new Error('Delete workflow failed: Workflow still exists');
    } catch (error) {
      if (error.message !== 'Workflow not found') {
        throw error;
      }
      console.log('Workflow deleted successfully');
    }
    
    console.log('Workflow automation tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Workflow automation tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
