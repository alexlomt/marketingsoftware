// Main test runner

import { testAuth } from './auth-test';
import { testOrganizations } from './organization-test';
import { testCRM } from './crm-test';
import { testPipelines } from './pipeline-test';
import { testWebsites } from './website-test';
import { testForms } from './form-test';
import { testEmailCampaigns } from './email-campaign-test';
import { testWorkflows } from './workflow-test';
import { testAppointments } from './appointment-test';
import { testCourses } from './course-test';

/**
 * Run all tests
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} Test results
 */
export async function runAllTests(env) {
  console.log('Running all tests for GoHighLevel clone application...');
  
  const results = {
    auth: null,
    organizations: null,
    crm: null,
    pipelines: null,
    websites: null,
    forms: null,
    emailCampaigns: null,
    workflows: null,
    appointments: null,
    courses: null
  };
  
  try {
    // Run authentication tests
    console.log('\n=== Running Authentication Tests ===\n');
    results.auth = await testAuth(env);
    
    // Run organization tests
    console.log('\n=== Running Organization Tests ===\n');
    results.organizations = await testOrganizations(env);
    
    // Run CRM tests
    console.log('\n=== Running CRM Tests ===\n');
    results.crm = await testCRM(env);
    
    // Run pipeline tests
    console.log('\n=== Running Pipeline Tests ===\n');
    results.pipelines = await testPipelines(env);
    
    // Run website tests
    console.log('\n=== Running Website Tests ===\n');
    results.websites = await testWebsites(env);
    
    // Run form tests
    console.log('\n=== Running Form Tests ===\n');
    results.forms = await testForms(env);
    
    // Run email campaign tests
    console.log('\n=== Running Email Campaign Tests ===\n');
    results.emailCampaigns = await testEmailCampaigns(env);
    
    // Run workflow tests
    console.log('\n=== Running Workflow Tests ===\n');
    results.workflows = await testWorkflows(env);
    
    // Run appointment tests
    console.log('\n=== Running Appointment Tests ===\n');
    results.appointments = await testAppointments(env);
    
    // Run course tests
    console.log('\n=== Running Course Tests ===\n');
    results.courses = await testCourses(env);
    
    // Calculate overall success
    const allSuccessful = Object.values(results).every(result => result && result.success);
    
    console.log('\n=== Test Summary ===\n');
    for (const [testName, result] of Object.entries(results)) {
      console.log(`${testName}: ${result && result.success ? 'PASSED' : 'FAILED'}`);
      if (result && !result.success) {
        console.log(`  Error: ${result.error}`);
      }
    }
    
    console.log(`\nOverall: ${allSuccessful ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return {
      success: allSuccessful,
      results
    };
  } catch (error) {
    console.error('Error running tests:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
