const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { db } = require('../src/lib/db');
const { Form } = require('../src/models/form');

// Mock the database connection
jest.mock('../src/lib/db', () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn(),
  }
}));

describe('Form Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Form.create', () => {
    it('should create a new form', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const formData = {
        organization_id: 1,
        title: 'Contact Request Form',
        description: 'General contact form for website visitors',
        fields: JSON.stringify([
          {
            id: 'first_name',
            type: 'text',
            label: 'First Name',
            required: true
          },
          {
            id: 'last_name',
            type: 'text',
            label: 'Last Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          }
        ]),
        settings: JSON.stringify({
          redirect_url: 'https://example.com/thank-you',
          submit_button_text: 'Submit'
        }),
        is_published: false,
        created_by: 1
      };
      
      // Call the method
      const result = await Form.create(formData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const formData = {
        organization_id: 1,
        // Missing title
        fields: '[]',
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Form.create(formData)).rejects.toThrow();
    });
  });
  
  describe('Form.findById', () => {
    it('should return form data for valid id', async () => {
      // Mock the database to return a form
      const mockForm = {
        id: 1,
        organization_id: 1,
        title: 'Contact Request Form',
        description: 'General contact form for website visitors',
        fields: JSON.stringify([
          {
            id: 'first_name',
            type: 'text',
            label: 'First Name',
            required: true
          }
        ]),
        settings: JSON.stringify({
          redirect_url: 'https://example.com/thank-you',
          submit_button_text: 'Submit'
        }),
        is_published: false,
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockForm);
      
      // Call the method
      const result = await Form.findById(1, 1); // form_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockForm,
        fields: JSON.parse(mockForm.fields),
        settings: JSON.parse(mockForm.settings)
      });
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no form
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Form.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Form.findByOrganization', () => {
    it('should return all forms for an organization', async () => {
      // Mock the database to return forms
      const mockForms = [
        {
          id: 1,
          organization_id: 1,
          title: 'Contact Request Form',
          description: 'General contact form for website visitors',
          fields: '[]',
          settings: '{}',
          is_published: false
        },
        {
          id: 2,
          organization_id: 1,
          title: 'Event Registration',
          description: 'Registration form for upcoming webinar',
          fields: '[]',
          settings: '{}',
          is_published: true
        }
      ];
      
      db.all.mockResolvedValue(mockForms);
      
      // Call the method
      const result = await Form.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockForms.map(form => ({
        ...form,
        fields: JSON.parse(form.fields),
        settings: JSON.parse(form.settings)
      })));
    });
  });
  
  describe('Form.update', () => {
    it('should update an existing form', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const formData = {
        title: 'Updated Contact Form',
        description: 'Updated contact form for website visitors',
        fields: [
          {
            id: 'first_name',
            type: 'text',
            label: 'First Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          }
        ]
      };
      
      // Call the method
      const result = await Form.update(1, 1, formData); // form_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
      
      // Verify fields were stringified
      const dbCall = db.run.mock.calls[0][1];
      expect(typeof dbCall.fields).toBe('string');
    });
    
    it('should throw an error if form does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const formData = {
        title: 'Updated Form'
      };
      
      // Call the method and expect it to throw
      await expect(Form.update(999, 1, formData)).rejects.toThrow('Form not found');
    });
  });
  
  describe('Form.publish', () => {
    it('should publish a form', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_published: false }); // Form exists and is not published
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Form.publish(1, 1); // form_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if form does not exist', async () => {
      // Mock the database to simulate form not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Form.publish(999, 1)).rejects.toThrow('Form not found');
    });
    
    it('should not update if form is already published', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_published: true }); // Form exists and is already published
      
      // Call the method
      const result = await Form.publish(1, 1);
      
      // Assertions
      expect(db.run).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Form is already published' });
    });
  });
  
  describe('Form.unpublish', () => {
    it('should unpublish a form', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_published: true }); // Form exists and is published
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Form.unpublish(1, 1); // form_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if form does not exist', async () => {
      // Mock the database to simulate form not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Form.unpublish(999, 1)).rejects.toThrow('Form not found');
    });
    
    it('should not update if form is already unpublished', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_published: false }); // Form exists and is already unpublished
      
      // Call the method
      const result = await Form.unpublish(1, 1);
      
      // Assertions
      expect(db.run).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Form is already unpublished' });
    });
  });
  
  describe('Form.submitForm', () => {
    it('should submit a form and create a submission', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ 
        id: 1, 
        is_published: true,
        fields: JSON.stringify([
          {
            id: 'first_name',
            type: 'text',
            label: 'First Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          }
        ])
      }); // Form exists and is published
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const submissionData = {
        first_name: 'John',
        email: 'john@example.com'
      };
      
      // Call the method
      const result = await Form.submitForm(1, submissionData); // form_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if form does not exist', async () => {
      // Mock the database to simulate form not found
      db.get.mockResolvedValueOnce(null);
      
      // Test data
      const submissionData = {
        first_name: 'John',
        email: 'john@example.com'
      };
      
      // Call the method and expect it to throw
      await expect(Form.submitForm(999, submissionData)).rejects.toThrow('Form not found');
    });
    
    it('should throw an error if form is not published', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_published: false }); // Form exists but is not published
      
      // Test data
      const submissionData = {
        first_name: 'John',
        email: 'john@example.com'
      };
      
      // Call the method and expect it to throw
      await expect(Form.submitForm(1, submissionData)).rejects.toThrow('Form is not published');
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ 
        id: 1, 
        is_published: true,
        fields: JSON.stringify([
          {
            id: 'first_name',
            type: 'text',
            label: 'First Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          }
        ])
      }); // Form exists and is published
      
      // Test data with missing required field
      const submissionData = {
        // Missing first_name
        email: 'john@example.com'
      };
      
      // Call the method and expect it to throw
      await expect(Form.submitForm(1, submissionData)).rejects.toThrow('Required field missing: first_name');
    });
  });
  
  describe('Form.getSubmissions', () => {
    it('should return all submissions for a form', async () => {
      // Mock the database to return submissions
      const mockSubmissions = [
        {
          id: 1,
          form_id: 1,
          data: JSON.stringify({
            first_name: 'John',
            email: 'john@example.com'
          }),
          created_at: '2025-03-22T10:00:00.000Z'
        },
        {
          id: 2,
          form_id: 1,
          data: JSON.stringify({
            first_name: 'Jane',
            email: 'jane@example.com'
          }),
          created_at: '2025-03-22T11:00:00.000Z'
        }
      ];
      
      db.all.mockResolvedValue(mockSubmissions);
      
      // Call the method
      const result = await Form.getSubmissions(1, 1); // form_id, organization_id
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockSubmissions.map(submission => ({
        ...submission,
        data: JSON.parse(submission.data)
      })));
    });
  });
  
  describe('Form.delete', () => {
    it('should delete an existing form', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Form.delete(1, 1); // form_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if form does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Form.delete(999, 1)).rejects.toThrow('Form not found');
    });
  });
});
