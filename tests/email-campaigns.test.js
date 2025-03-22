const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { db } = require('../src/lib/db');
const { EmailCampaign } = require('../src/models/emailCampaign');

// Mock the database connection
jest.mock('../src/lib/db', () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn(),
  }
}));

describe('Email Campaign Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('EmailCampaign.create', () => {
    it('should create a new email campaign', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const campaignData = {
        organization_id: 1,
        name: 'March Newsletter',
        subject: 'Your March Update is Here!',
        content: '<p>Hello {{first_name}},</p><p>Here is your monthly update...</p>',
        sender_name: 'Marketing Team',
        sender_email: 'marketing@example.com',
        status: 'draft',
        created_by: 1
      };
      
      // Call the method
      const result = await EmailCampaign.create(campaignData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const campaignData = {
        organization_id: 1,
        // Missing name and subject
        content: '<p>Hello {{first_name}},</p><p>Here is your monthly update...</p>',
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.create(campaignData)).rejects.toThrow();
    });
  });
  
  describe('EmailCampaign.findById', () => {
    it('should return campaign data for valid id', async () => {
      // Mock the database to return a campaign
      const mockCampaign = {
        id: 1,
        organization_id: 1,
        name: 'March Newsletter',
        subject: 'Your March Update is Here!',
        content: '<p>Hello {{first_name}},</p><p>Here is your monthly update...</p>',
        sender_name: 'Marketing Team',
        sender_email: 'marketing@example.com',
        status: 'draft',
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockCampaign);
      
      // Call the method
      const result = await EmailCampaign.findById(1, 1); // campaign_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockCampaign);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no campaign
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await EmailCampaign.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('EmailCampaign.findByOrganization', () => {
    it('should return all campaigns for an organization', async () => {
      // Mock the database to return campaigns
      const mockCampaigns = [
        {
          id: 1,
          organization_id: 1,
          name: 'March Newsletter',
          subject: 'Your March Update is Here!',
          status: 'draft'
        },
        {
          id: 2,
          organization_id: 1,
          name: 'Product Launch',
          subject: 'Introducing Our New Product Line',
          status: 'scheduled'
        }
      ];
      
      db.all.mockResolvedValue(mockCampaigns);
      
      // Call the method
      const result = await EmailCampaign.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockCampaigns);
    });
  });
  
  describe('EmailCampaign.update', () => {
    it('should update an existing campaign', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const campaignData = {
        name: 'Updated March Newsletter',
        subject: 'Your Updated March Newsletter is Here!',
        content: '<p>Hello {{first_name}},</p><p>Here is your updated monthly newsletter...</p>'
      };
      
      // Call the method
      const result = await EmailCampaign.update(1, 1, campaignData); // campaign_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if campaign does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const campaignData = {
        name: 'Updated Campaign'
      };
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.update(999, 1, campaignData)).rejects.toThrow('Email campaign not found');
    });
  });
  
  describe('EmailCampaign.updateStatus', () => {
    it('should update the status of a campaign', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, status: 'draft' }); // Campaign exists
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await EmailCampaign.updateStatus(1, 1, 'scheduled', '2025-04-01T09:00:00.000Z'); // campaign_id, organization_id, status, scheduled_time
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if campaign does not exist', async () => {
      // Mock the database to simulate campaign not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.updateStatus(999, 1, 'scheduled')).rejects.toThrow('Email campaign not found');
    });
    
    it('should throw an error if trying to schedule without a time', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, status: 'draft' }); // Campaign exists
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.updateStatus(1, 1, 'scheduled')).rejects.toThrow('Scheduled time is required');
    });
    
    it('should throw an error if trying to change status of a sent campaign', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, status: 'sent' }); // Campaign already sent
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.updateStatus(1, 1, 'draft')).rejects.toThrow('Cannot change status of a sent campaign');
    });
  });
  
  describe('EmailCampaign.addRecipient', () => {
    it('should add a recipient to a campaign', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1 }); // Campaign exists
      db.get.mockResolvedValueOnce({ id: 1 }); // Contact exists
      db.get.mockResolvedValueOnce(null); // Relation doesn't exist yet
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Call the method
      const result = await EmailCampaign.addRecipient(1, 1, 1); // campaign_id, organization_id, contact_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if campaign does not exist', async () => {
      // Mock the database to simulate campaign not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.addRecipient(999, 1, 1)).rejects.toThrow('Email campaign not found');
    });
    
    it('should throw an error if contact does not exist', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1 }); // Campaign exists
      db.get.mockResolvedValueOnce(null); // Contact doesn't exist
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.addRecipient(1, 1, 999)).rejects.toThrow('Contact not found');
    });
  });
  
  describe('EmailCampaign.removeRecipient', () => {
    it('should remove a recipient from a campaign', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await EmailCampaign.removeRecipient(1, 1, 1); // campaign_id, organization_id, contact_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if relation does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.removeRecipient(1, 1, 999)).rejects.toThrow('Contact not in campaign recipients');
    });
  });
  
  describe('EmailCampaign.getRecipients', () => {
    it('should return all recipients for a campaign', async () => {
      // Mock the database to return recipients
      const mockRecipients = [
        {
          contact_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com'
        },
        {
          contact_id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com'
        }
      ];
      
      db.all.mockResolvedValue(mockRecipients);
      
      // Call the method
      const result = await EmailCampaign.getRecipients(1, 1); // campaign_id, organization_id
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockRecipients);
    });
  });
  
  describe('EmailCampaign.delete', () => {
    it('should delete an existing campaign', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await EmailCampaign.delete(1, 1); // campaign_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if campaign does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(EmailCampaign.delete(999, 1)).rejects.toThrow('Email campaign not found');
    });
  });
});
