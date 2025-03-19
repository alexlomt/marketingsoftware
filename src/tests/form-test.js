// Test for form functionality

import { initTestDB, createTestUser, createTestOrganization, cleanupTestData } from '../lib/test-utils';
import { createForm, getFormById, getOrganizationForms, updateForm, deleteForm, submitFormData, getFormSubmissions } from '../lib/forms';

/**
 * Test form functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testForms(env) {
  console.log('Testing form functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user and organization
    console.log('Creating test user and organization...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    
    // Test create form
    console.log('Testing create form...');
    const formData = {
      name: 'Contact Form',
      fields: [
        {
          id: 'name',
          label: 'Full Name',
          type: 'text',
          required: true
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true
        },
        {
          id: 'message',
          label: 'Message',
          type: 'textarea',
          required: false
        }
      ],
      settings: {
        submitButtonText: 'Send Message',
        successMessage: 'Thank you for your message!',
        redirectUrl: ''
      }
    };
    
    const form = await createForm(
      db, 
      organization.id, 
      formData.name, 
      formData.fields, 
      formData.settings
    );
    console.log('Form created successfully:', form);
    
    if (!form.id || form.name !== formData.name) {
      throw new Error('Create form failed: Invalid form data');
    }
    
    // Test get form by ID
    console.log('Testing get form by ID...');
    const retrievedForm = await getFormById(db, form.id, organization.id);
    console.log('Form retrieved successfully:', retrievedForm);
    
    if (retrievedForm.id !== form.id || retrievedForm.name !== formData.name) {
      throw new Error('Get form by ID failed: Invalid form data');
    }
    
    // Test get organization forms
    console.log('Testing get organization forms...');
    const forms = await getOrganizationForms(db, organization.id);
    console.log('Organization forms retrieved successfully:', forms);
    
    if (forms.length !== 1 || forms[0].id !== form.id) {
      throw new Error('Get organization forms failed: Form not found');
    }
    
    // Test update form
    console.log('Testing update form...');
    const updatedFormData = {
      name: 'Updated Contact Form',
      fields: [
        ...formData.fields,
        {
          id: 'phone',
          label: 'Phone Number',
          type: 'tel',
          required: false
        }
      ],
      settings: {
        ...formData.settings,
        submitButtonText: 'Submit'
      }
    };
    
    const updatedForm = await updateForm(
      db, 
      form.id, 
      organization.id, 
      updatedFormData
    );
    console.log('Form updated successfully:', updatedForm);
    
    if (updatedForm.name !== updatedFormData.name || 
        updatedForm.fields.length !== updatedFormData.fields.length ||
        updatedForm.settings.submitButtonText !== updatedFormData.settings.submitButtonText) {
      throw new Error('Update form failed: Form not updated correctly');
    }
    
    // Test submit form data
    console.log('Testing submit form data...');
    const submissionData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      message: 'This is a test message',
      phone: '123-456-7890'
    };
    
    const submission = await submitFormData(db, form.id, submissionData);
    console.log('Form submission created successfully:', submission);
    
    if (!submission.id || !submission.data) {
      throw new Error('Submit form data failed: Invalid submission data');
    }
    
    // Test get form submissions
    console.log('Testing get form submissions...');
    const submissions = await getFormSubmissions(db, form.id, organization.id);
    console.log('Form submissions retrieved successfully:', submissions);
    
    if (submissions.length !== 1 || submissions[0].id !== submission.id) {
      throw new Error('Get form submissions failed: Submission not found');
    }
    
    // Test delete form
    console.log('Testing delete form...');
    await deleteForm(db, form.id, organization.id);
    
    // Verify form was deleted
    try {
      await getFormById(db, form.id, organization.id);
      throw new Error('Delete form failed: Form still exists');
    } catch (error) {
      if (error.message !== 'Form not found') {
        throw error;
      }
      console.log('Form deleted successfully');
    }
    
    console.log('Form tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Form tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
