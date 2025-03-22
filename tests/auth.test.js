const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../src/lib/db');
const { User } = require('../src/models/user');
const { Organization } = require('../src/models/organization');

// Mock the database connection
jest.mock('../src/lib/db', () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn(),
  }
}));

describe('User Authentication', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('User.create', () => {
    it('should hash password and create a new user', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        organization_id: 1,
        role: 'admin'
      };
      
      // Call the method
      const result = await User.create(userData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
      
      // Verify the password was hashed
      const dbCall = db.run.mock.calls[0][1];
      expect(dbCall.email).toBe(userData.email);
      expect(dbCall.password).not.toBe(userData.password);
      expect(dbCall.password.startsWith('$2a$')).toBe(true);
    });
    
    it('should throw an error if email already exists', async () => {
      // Mock the database to simulate a duplicate email
      db.get.mockResolvedValue({ id: 1 });
      
      // Test data
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Existing',
        last_name: 'User',
        organization_id: 1,
        role: 'user'
      };
      
      // Call the method and expect it to throw
      await expect(User.create(userData)).rejects.toThrow('Email already exists');
    });
  });
  
  describe('User.authenticate', () => {
    it('should return user data and token for valid credentials', async () => {
      // Mock the database to return a user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        organization_id: 1,
        role: 'admin'
      };
      
      db.get.mockResolvedValue(mockUser);
      
      // Call the method
      const result = await User.authenticate('test@example.com', 'password123');
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        organization_id: mockUser.organization_id,
        role: mockUser.role
      });
      expect(result.token).toBeDefined();
      
      // Verify the token
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'your-secret-key');
      expect(decoded.userId).toBe(mockUser.id);
    });
    
    it('should throw an error for invalid email', async () => {
      // Mock the database to return no user
      db.get.mockResolvedValue(null);
      
      // Call the method and expect it to throw
      await expect(User.authenticate('nonexistent@example.com', 'password123'))
        .rejects.toThrow('Invalid email or password');
    });
    
    it('should throw an error for invalid password', async () => {
      // Mock the database to return a user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword
      };
      
      db.get.mockResolvedValue(mockUser);
      
      // Call the method with wrong password and expect it to throw
      await expect(User.authenticate('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });
  });
  
  describe('User.findById', () => {
    it('should return user data for valid id', async () => {
      // Mock the database to return a user
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        organization_id: 1,
        role: 'admin'
      };
      
      db.get.mockResolvedValue(mockUser);
      
      // Call the method
      const result = await User.findById(1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no user
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await User.findById(999);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});

describe('Organization Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Organization.create', () => {
    it('should create a new organization', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const orgData = {
        name: 'Test Organization',
        industry: 'Technology',
        size: '10-50',
        website: 'https://example.com'
      };
      
      // Call the method
      const result = await Organization.create(orgData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
  });
  
  describe('Organization.findById', () => {
    it('should return organization data for valid id', async () => {
      // Mock the database to return an organization
      const mockOrg = {
        id: 1,
        name: 'Test Organization',
        industry: 'Technology',
        size: '10-50',
        website: 'https://example.com'
      };
      
      db.get.mockResolvedValue(mockOrg);
      
      // Call the method
      const result = await Organization.findById(1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockOrg);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no organization
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Organization.findById(999);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Organization.update', () => {
    it('should update an existing organization', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const orgData = {
        name: 'Updated Organization',
        industry: 'Software',
        size: '50-100',
        website: 'https://updated-example.com'
      };
      
      // Call the method
      const result = await Organization.update(1, orgData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if organization does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const orgData = {
        name: 'Updated Organization'
      };
      
      // Call the method and expect it to throw
      await expect(Organization.update(999, orgData)).rejects.toThrow('Organization not found');
    });
  });
});
