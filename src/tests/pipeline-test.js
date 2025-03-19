// Test for pipeline management functionality

import { initTestDB, createTestUser, createTestOrganization, createTestContact, cleanupTestData } from '../lib/test-utils';
import { createPipeline, getPipelineById, getOrganizationPipelines, updatePipeline, createPipelineStage, getPipelineStages, updatePipelineStage, createDeal, getDealById, getOrganizationDeals, updateDeal, deleteDeal } from '../lib/pipelines';

/**
 * Test pipeline management functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testPipelines(env) {
  console.log('Testing pipeline management functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user, organization, and contact
    console.log('Creating test user, organization, and contact...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    const contact = await createTestContact(db, organization.id);
    
    // Test create pipeline
    console.log('Testing create pipeline...');
    const pipelineName = 'Sales Pipeline';
    const pipeline = await createPipeline(db, organization.id, pipelineName);
    console.log('Pipeline created successfully:', pipeline);
    
    if (!pipeline.id || pipeline.name !== pipelineName) {
      throw new Error('Create pipeline failed: Invalid pipeline data');
    }
    
    // Test get pipeline by ID
    console.log('Testing get pipeline by ID...');
    const retrievedPipeline = await getPipelineById(db, pipeline.id, organization.id);
    console.log('Pipeline retrieved successfully:', retrievedPipeline);
    
    if (retrievedPipeline.id !== pipeline.id || retrievedPipeline.name !== pipelineName) {
      throw new Error('Get pipeline by ID failed: Invalid pipeline data');
    }
    
    // Test get organization pipelines
    console.log('Testing get organization pipelines...');
    const pipelines = await getOrganizationPipelines(db, organization.id);
    console.log('Organization pipelines retrieved successfully:', pipelines);
    
    if (pipelines.length !== 1 || pipelines[0].id !== pipeline.id) {
      throw new Error('Get organization pipelines failed: Pipeline not found');
    }
    
    // Test update pipeline
    console.log('Testing update pipeline...');
    const updatedPipelineName = 'Updated Sales Pipeline';
    const updatedPipeline = await updatePipeline(db, pipeline.id, organization.id, updatedPipelineName);
    console.log('Pipeline updated successfully:', updatedPipeline);
    
    if (updatedPipeline.name !== updatedPipelineName) {
      throw new Error('Update pipeline failed: Name not updated');
    }
    
    // Test create pipeline stage
    console.log('Testing create pipeline stage...');
    const stageData = {
      name: 'Lead',
      orderIndex: 0
    };
    
    const stage = await createPipelineStage(db, pipeline.id, organization.id, stageData.name, stageData.orderIndex);
    console.log('Pipeline stage created successfully:', stage);
    
    if (!stage.id || stage.name !== stageData.name || stage.order_index !== stageData.orderIndex) {
      throw new Error('Create pipeline stage failed: Invalid stage data');
    }
    
    // Create additional stages for testing
    const stage2 = await createPipelineStage(db, pipeline.id, organization.id, 'Qualified', 1);
    const stage3 = await createPipelineStage(db, pipeline.id, organization.id, 'Proposal', 2);
    const stage4 = await createPipelineStage(db, pipeline.id, organization.id, 'Closed Won', 3);
    
    // Test get pipeline stages
    console.log('Testing get pipeline stages...');
    const stages = await getPipelineStages(db, pipeline.id, organization.id);
    console.log('Pipeline stages retrieved successfully:', stages);
    
    if (stages.length !== 4) {
      throw new Error('Get pipeline stages failed: Incorrect number of stages');
    }
    
    // Test update pipeline stage
    console.log('Testing update pipeline stage...');
    const updatedStageData = {
      name: 'New Lead',
      order_index: 0
    };
    
    const updatedStage = await updatePipelineStage(db, stage.id, pipeline.id, organization.id, updatedStageData);
    console.log('Pipeline stage updated successfully:', updatedStage);
    
    if (updatedStage.name !== updatedStageData.name) {
      throw new Error('Update pipeline stage failed: Name not updated');
    }
    
    // Test create deal
    console.log('Testing create deal...');
    const dealData = {
      pipeline_id: pipeline.id,
      stage_id: stage.id,
      contact_id: contact.id,
      title: 'New Deal',
      value: 10000,
      currency: 'USD',
      expected_close_date: new Date().toISOString()
    };
    
    const deal = await createDeal(db, organization.id, dealData);
    console.log('Deal created successfully:', deal);
    
    if (!deal.id || deal.title !== dealData.title || deal.value !== dealData.value) {
      throw new Error('Create deal failed: Invalid deal data');
    }
    
    // Test get deal by ID
    console.log('Testing get deal by ID...');
    const retrievedDeal = await getDealById(db, deal.id, organization.id);
    console.log('Deal retrieved successfully:', retrievedDeal);
    
    if (retrievedDeal.id !== deal.id || retrievedDeal.title !== dealData.title) {
      throw new Error('Get deal by ID failed: Invalid deal data');
    }
    
    // Test get organization deals
    console.log('Testing get organization deals...');
    const deals = await getOrganizationDeals(db, organization.id);
    console.log('Organization deals retrieved successfully:', deals);
    
    if (deals.length !== 1 || deals[0].id !== deal.id) {
      throw new Error('Get organization deals failed: Deal not found');
    }
    
    // Test update deal
    console.log('Testing update deal...');
    const updatedDealData = {
      title: 'Updated Deal',
      value: 15000,
      stage_id: stage2.id
    };
    
    const updatedDeal = await updateDeal(db, deal.id, organization.id, updatedDealData);
    console.log('Deal updated successfully:', updatedDeal);
    
    if (updatedDeal.title !== updatedDealData.title || 
        updatedDeal.value !== updatedDealData.value || 
        updatedDeal.stage_id !== updatedDealData.stage_id) {
      throw new Error('Update deal failed: Deal not updated correctly');
    }
    
    // Test delete deal
    console.log('Testing delete deal...');
    await deleteDeal(db, deal.id, organization.id);
    
    // Verify deal was deleted
    try {
      await getDealById(db, deal.id, organization.id);
      throw new Error('Delete deal failed: Deal still exists');
    } catch (error) {
      if (error.message !== 'Deal not found') {
        throw error;
      }
      console.log('Deal deleted successfully');
    }
    
    console.log('Pipeline management tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Pipeline management tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
