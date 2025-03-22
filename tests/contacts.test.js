const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { db } = require('../src/lib/db');
const { Contact } = require('../src/models/contact');
const { Tag } = require('../src/models/tag');

// Mock the database connection
jest.mock('../src/lib/db', () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn(),
  }
}));

describe('Contact Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Contact.create', () => {
    it('should create a new contact', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const contactData = {
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        status: 'active',
        source: 'website',
        created_by: 1
      };
      
      // Call the method
      const result = await Contact.create(contactData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const contactData = {
        organization_id: 1,
        // Missing first_name and last_name
        email: 'john.doe@example.com',
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Contact.create(contactData)).rejects.toThrow();
    });
  });
  
  describe('Contact.findById', () => {
    it('should return contact data for valid id', async () => {
      // Mock the database to return a contact
      const mockContact = {
        id: 1,
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        status: 'active',
        source: 'website',
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockContact);
      
      // Call the method
      const result = await Contact.findById(1, 1); // contact_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockContact);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no contact
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Contact.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Contact.findByOrganization', () => {
    it('should return all contacts for an organization', async () => {
      // Mock the database to return contacts
      const mockContacts = [
        {
          id: 1,
          organization_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com'
        },
        {
          id: 2,
          organization_id: 1,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com'
        }
      ];
      
      db.all.mockResolvedValue(mockContacts);
      
      // Call the method
      const result = await Contact.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockContacts);
    });
  });
  
  describe('Contact.update', () => {
    it('should update an existing contact', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const contactData = {
        first_name: 'Johnny',
        last_name: 'Doe',
        email: 'johnny.doe@example.com'
      };
      
      // Call the method
      const result = await Contact.update(1, 1, contactData); // contact_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if contact does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const contactData = {
        first_name: 'Johnny'
      };
      
      // Call the method and expect it to throw
      await expect(Contact.update(999, 1, contactData)).rejects.toThrow('Contact not found');
    });
  });
  
  describe('Contact.delete', () => {
    it('should delete an existing contact', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Contact.delete(1, 1); // contact_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if contact does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Contact.delete(999, 1)).rejects.toThrow('Contact not found');
    });
  });
  
  describe('Contact.addTag', () => {
    it('should add a tag to a contact', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1 }); // Contact exists
      db.get.mockResolvedValueOnce({ id: 1 }); // Tag exists
      db.get.mockResolvedValueOnce(null); // Relation doesn't exist yet
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Call the method
      const result = await Contact.addTag(1, 1, 1); // contact_id, organization_id, tag_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if contact does not exist', async () => {
      // Mock the database to simulate contact not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Contact.addTag(999, 1, 1)).rejects.toThrow('Contact not found');
    });
  });
  
  describe('Contact.removeTag', () => {
    it('should remove a tag from a contact', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Contact.removeTag(1, 1, 1); // contact_id, organization_id, tag_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if relation does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Contact.removeTag(1, 1, 999)).rejects.toThrow('Tag not associated with contact');
    });
  });
});

describe('Tag Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Tag.create', () => {
    it('should create a new tag', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const tagData = {
        organization_id: 1,
        name: 'VIP',
        color: '#FF0000',
        created_by: 1
      };
      
      // Call the method
      const result = await Tag.create(tagData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const tagData = {
        organization_id: 1,
        // Missing name
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Tag.create(tagData)).rejects.toThrow();
    });
  });
  
  describe('Tag.findByOrganization', () => {
    it('should return all tags for an organization', async () => {
      // Mock the database to return tags
      const mockTags = [
        {
          id: 1,
          organization_id: 1,
          name: 'VIP',
          color: '#FF0000'
        },
        {
          id: 2,
          organization_id: 1,
          name: 'Lead',
          color: '#00FF00'
        }
      ];
      
      db.all.mockResolvedValue(mockTags);
      
      // Call the method
      const result = await Tag.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockTags);
    });
  });
  
  describe('Tag.findById', () => {
    it('should return tag data for valid id', async () => {
      // Mock the database to return a tag
      const mockTag = {
        id: 1,
        organization_id: 1,
        name: 'VIP',
        color: '#FF0000',
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockTag);
      
      // Call the method
      const result = await Tag.findById(1, 1); // tag_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockTag);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no tag
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Tag.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
