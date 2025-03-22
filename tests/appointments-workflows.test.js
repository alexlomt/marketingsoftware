const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { db } = require('../src/lib/db');
const { Appointment } = require('../src/models/appointment');
const { Workflow } = require('../src/models/workflow');

// Mock the database connection
jest.mock('../src/lib/db', () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn(),
  }
}));

describe('Appointment Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Appointment.create', () => {
    it('should create a new appointment', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const appointmentData = {
        organization_id: 1,
        title: 'Initial Consultation',
        description: 'Discuss project requirements',
        contact_id: 1,
        start_time: '2025-04-15T10:00:00.000Z',
        end_time: '2025-04-15T11:00:00.000Z',
        location: 'Zoom Meeting',
        status: 'scheduled',
        created_by: 1
      };
      
      // Call the method
      const result = await Appointment.create(appointmentData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const appointmentData = {
        organization_id: 1,
        // Missing title and start_time
        contact_id: 1,
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Appointment.create(appointmentData)).rejects.toThrow();
    });
  });
  
  describe('Appointment.findById', () => {
    it('should return appointment data for valid id', async () => {
      // Mock the database to return an appointment
      const mockAppointment = {
        id: 1,
        organization_id: 1,
        title: 'Initial Consultation',
        description: 'Discuss project requirements',
        contact_id: 1,
        start_time: '2025-04-15T10:00:00.000Z',
        end_time: '2025-04-15T11:00:00.000Z',
        location: 'Zoom Meeting',
        status: 'scheduled',
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockAppointment);
      
      // Call the method
      const result = await Appointment.findById(1, 1); // appointment_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockAppointment);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no appointment
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Appointment.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Appointment.findByOrganization', () => {
    it('should return all appointments for an organization', async () => {
      // Mock the database to return appointments
      const mockAppointments = [
        {
          id: 1,
          organization_id: 1,
          title: 'Initial Consultation',
          contact_id: 1,
          start_time: '2025-04-15T10:00:00.000Z',
          status: 'scheduled'
        },
        {
          id: 2,
          organization_id: 1,
          title: 'Follow-up Meeting',
          contact_id: 2,
          start_time: '2025-04-16T14:00:00.000Z',
          status: 'scheduled'
        }
      ];
      
      db.all.mockResolvedValue(mockAppointments);
      
      // Call the method
      const result = await Appointment.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });
  });
  
  describe('Appointment.findByContact', () => {
    it('should return all appointments for a contact', async () => {
      // Mock the database to return appointments
      const mockAppointments = [
        {
          id: 1,
          organization_id: 1,
          title: 'Initial Consultation',
          contact_id: 1,
          start_time: '2025-04-15T10:00:00.000Z',
          status: 'scheduled'
        },
        {
          id: 3,
          organization_id: 1,
          title: 'Project Review',
          contact_id: 1,
          start_time: '2025-04-20T11:00:00.000Z',
          status: 'scheduled'
        }
      ];
      
      db.all.mockResolvedValue(mockAppointments);
      
      // Call the method
      const result = await Appointment.findByContact(1, 1); // contact_id, organization_id
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });
  });
  
  describe('Appointment.update', () => {
    it('should update an existing appointment', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const appointmentData = {
        title: 'Updated Consultation',
        description: 'Updated project requirements discussion',
        start_time: '2025-04-15T11:00:00.000Z',
        end_time: '2025-04-15T12:00:00.000Z'
      };
      
      // Call the method
      const result = await Appointment.update(1, 1, appointmentData); // appointment_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if appointment does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const appointmentData = {
        title: 'Updated Appointment'
      };
      
      // Call the method and expect it to throw
      await expect(Appointment.update(999, 1, appointmentData)).rejects.toThrow('Appointment not found');
    });
  });
  
  describe('Appointment.updateStatus', () => {
    it('should update the status of an appointment', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, status: 'scheduled' }); // Appointment exists
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Appointment.updateStatus(1, 1, 'completed'); // appointment_id, organization_id, status
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if appointment does not exist', async () => {
      // Mock the database to simulate appointment not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Appointment.updateStatus(999, 1, 'completed')).rejects.toThrow('Appointment not found');
    });
    
    it('should throw an error if status is invalid', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, status: 'scheduled' }); // Appointment exists
      
      // Call the method and expect it to throw
      await expect(Appointment.updateStatus(1, 1, 'invalid_status')).rejects.toThrow('Invalid status');
    });
  });
  
  describe('Appointment.delete', () => {
    it('should delete an existing appointment', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Appointment.delete(1, 1); // appointment_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if appointment does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Appointment.delete(999, 1)).rejects.toThrow('Appointment not found');
    });
  });
});

describe('Workflow Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Workflow.create', () => {
    it('should create a new workflow', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const workflowData = {
        organization_id: 1,
        name: 'New Lead Follow-up',
        description: 'Automated follow-up process for new leads',
        trigger_type: 'contact_created',
        trigger_config: JSON.stringify({
          tags: ['lead']
        }),
        actions: JSON.stringify([
          {
            type: 'email',
            config: {
              template_id: 1,
              delay: 0
            }
          },
          {
            type: 'task',
            config: {
              title: 'Follow up with new lead',
              assigned_to: 1,
              delay: 86400 // 1 day in seconds
            }
          }
        ]),
        is_active: false,
        created_by: 1
      };
      
      // Call the method
      const result = await Workflow.create(workflowData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const workflowData = {
        organization_id: 1,
        // Missing name and trigger_type
        actions: '[]',
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Workflow.create(workflowData)).rejects.toThrow();
    });
  });
  
  describe('Workflow.findById', () => {
    it('should return workflow data for valid id', async () => {
      // Mock the database to return a workflow
      const mockWorkflow = {
        id: 1,
        organization_id: 1,
        name: 'New Lead Follow-up',
        description: 'Automated follow-up process for new leads',
        trigger_type: 'contact_created',
        trigger_config: '{"tags":["lead"]}',
        actions: '[{"type":"email","config":{"template_id":1,"delay":0}}]',
        is_active: false,
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockWorkflow);
      
      // Call the method
      const result = await Workflow.findById(1, 1); // workflow_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockWorkflow,
        trigger_config: JSON.parse(mockWorkflow.trigger_config),
        actions: JSON.parse(mockWorkflow.actions)
      });
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no workflow
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Workflow.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Workflow.findByOrganization', () => {
    it('should return all workflows for an organization', async () => {
      // Mock the database to return workflows
      const mockWorkflows = [
        {
          id: 1,
          organization_id: 1,
          name: 'New Lead Follow-up',
          trigger_type: 'contact_created',
          trigger_config: '{"tags":["lead"]}',
          actions: '[]',
          is_active: false
        },
        {
          id: 2,
          organization_id: 1,
          name: 'Deal Won Notification',
          trigger_type: 'deal_stage_changed',
          trigger_config: '{"stage_id":5}',
          actions: '[]',
          is_active: true
        }
      ];
      
      db.all.mockResolvedValue(mockWorkflows);
      
      // Call the method
      const result = await Workflow.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockWorkflows.map(workflow => ({
        ...workflow,
        trigger_config: JSON.parse(workflow.trigger_config),
        actions: JSON.parse(workflow.actions)
      })));
    });
  });
  
  describe('Workflow.update', () => {
    it('should update an existing workflow', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const workflowData = {
        name: 'Updated Lead Follow-up',
        description: 'Updated follow-up process for new leads',
        actions: [
          {
            type: 'email',
            config: {
              template_id: 2,
              delay: 0
            }
          }
        ]
      };
      
      // Call the method
      const result = await Workflow.update(1, 1, workflowData); // workflow_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
      
      // Verify actions were stringified
      const dbCall = db.run.mock.calls[0][1];
      expect(typeof dbCall.actions).toBe('string');
    });
    
    it('should throw an error if workflow does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const workflowData = {
        name: 'Updated Workflow'
      };
      
      // Call the method and expect it to throw
      await expect(Workflow.update(999, 1, workflowData)).rejects.toThrow('Workflow not found');
    });
  });
  
  describe('Workflow.activate', () => {
    it('should activate a workflow', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_active: false }); // Workflow exists and is not active
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Workflow.activate(1, 1); // workflow_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if workflow does not exist', async () => {
      // Mock the database to simulate workflow not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Workflow.activate(999, 1)).rejects.toThrow('Workflow not found');
    });
    
    it('should not update if workflow is already active', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_active: true }); // Workflow exists and is already active
      
      // Call the method
      const result = await Workflow.activate(1, 1);
      
      // Assertions
      expect(db.run).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Workflow is already active' });
    });
  });
  
  describe('Workflow.deactivate', () => {
    it('should deactivate a workflow', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_active: true }); // Workflow exists and is active
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Workflow.deactivate(1, 1); // workflow_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if workflow does not exist', async () => {
      // Mock the database to simulate workflow not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Workflow.deactivate(999, 1)).rejects.toThrow('Workflow not found');
    });
    
    it('should not update if workflow is already inactive', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, is_active: false }); // Workflow exists and is already inactive
      
      // Call the method
      const result = await Workflow.deactivate(1, 1);
      
      // Assertions
      expect(db.run).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Workflow is already inactive' });
    });
  });
  
  describe('Workflow.delete', () => {
    it('should delete an existing workflow', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Workflow.delete(1, 1); // workflow_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if workflow does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Workflow.delete(999, 1)).rejects.toThrow('Workflow not found');
    });
  });
});
