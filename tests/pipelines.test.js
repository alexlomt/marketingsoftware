const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { db } = require('../src/lib/db');
const { Pipeline } = require('../src/models/pipeline');
const { Deal } = require('../src/models/deal');

// Mock the database connection
jest.mock('../src/lib/db', () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn(),
  }
}));

describe('Pipeline Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Pipeline.create', () => {
    it('should create a new pipeline', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const pipelineData = {
        organization_id: 1,
        name: 'Sales Pipeline',
        description: 'Main sales process',
        created_by: 1
      };
      
      // Call the method
      const result = await Pipeline.create(pipelineData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const pipelineData = {
        organization_id: 1,
        // Missing name
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Pipeline.create(pipelineData)).rejects.toThrow();
    });
  });
  
  describe('Pipeline.findById', () => {
    it('should return pipeline data for valid id', async () => {
      // Mock the database to return a pipeline
      const mockPipeline = {
        id: 1,
        organization_id: 1,
        name: 'Sales Pipeline',
        description: 'Main sales process',
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockPipeline);
      
      // Call the method
      const result = await Pipeline.findById(1, 1); // pipeline_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockPipeline);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no pipeline
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Pipeline.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Pipeline.findByOrganization', () => {
    it('should return all pipelines for an organization', async () => {
      // Mock the database to return pipelines
      const mockPipelines = [
        {
          id: 1,
          organization_id: 1,
          name: 'Sales Pipeline',
          description: 'Main sales process'
        },
        {
          id: 2,
          organization_id: 1,
          name: 'Customer Onboarding',
          description: 'Onboarding process for new customers'
        }
      ];
      
      db.all.mockResolvedValue(mockPipelines);
      
      // Call the method
      const result = await Pipeline.findByOrganization(1);
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockPipelines);
    });
  });
  
  describe('Pipeline.update', () => {
    it('should update an existing pipeline', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const pipelineData = {
        name: 'Updated Sales Pipeline',
        description: 'Updated sales process'
      };
      
      // Call the method
      const result = await Pipeline.update(1, 1, pipelineData); // pipeline_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if pipeline does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const pipelineData = {
        name: 'Updated Pipeline'
      };
      
      // Call the method and expect it to throw
      await expect(Pipeline.update(999, 1, pipelineData)).rejects.toThrow('Pipeline not found');
    });
  });
  
  describe('Pipeline.delete', () => {
    it('should delete an existing pipeline', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Pipeline.delete(1, 1); // pipeline_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if pipeline does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Pipeline.delete(999, 1)).rejects.toThrow('Pipeline not found');
    });
  });
  
  describe('Pipeline.addStage', () => {
    it('should add a stage to a pipeline', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1 }); // Pipeline exists
      db.all.mockResolvedValueOnce([{ position: 2 }]); // Get max position
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const stageData = {
        name: 'Qualification',
        description: 'Initial qualification stage',
        color: '#FF0000'
      };
      
      // Call the method
      const result = await Pipeline.addStage(1, 1, stageData); // pipeline_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if pipeline does not exist', async () => {
      // Mock the database to simulate pipeline not found
      db.get.mockResolvedValueOnce(null);
      
      // Test data
      const stageData = {
        name: 'Qualification'
      };
      
      // Call the method and expect it to throw
      await expect(Pipeline.addStage(999, 1, stageData)).rejects.toThrow('Pipeline not found');
    });
  });
});

describe('Deal Management', () => {
  beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Deal.create', () => {
    it('should create a new deal', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ lastID: 1 });
      
      // Test data
      const dealData = {
        organization_id: 1,
        pipeline_id: 1,
        stage_id: 1,
        title: 'Enterprise Software License',
        value: 15000,
        contact_id: 1,
        probability: 75,
        expected_close_date: '2025-04-15',
        created_by: 1
      };
      
      // Call the method
      const result = await Deal.create(dealData);
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Test data with missing required fields
      const dealData = {
        organization_id: 1,
        pipeline_id: 1,
        // Missing title and stage_id
        value: 15000,
        created_by: 1
      };
      
      // Call the method and expect it to throw
      await expect(Deal.create(dealData)).rejects.toThrow();
    });
  });
  
  describe('Deal.findById', () => {
    it('should return deal data for valid id', async () => {
      // Mock the database to return a deal
      const mockDeal = {
        id: 1,
        organization_id: 1,
        pipeline_id: 1,
        stage_id: 1,
        title: 'Enterprise Software License',
        value: 15000,
        contact_id: 1,
        probability: 75,
        expected_close_date: '2025-04-15',
        created_at: '2025-03-22T10:00:00.000Z',
        created_by: 1
      };
      
      db.get.mockResolvedValue(mockDeal);
      
      // Call the method
      const result = await Deal.findById(1, 1); // deal_id, organization_id
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockDeal);
    });
    
    it('should return null for non-existent id', async () => {
      // Mock the database to return no deal
      db.get.mockResolvedValue(null);
      
      // Call the method
      const result = await Deal.findById(999, 1);
      
      // Assertions
      expect(db.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('Deal.findByPipeline', () => {
    it('should return all deals for a pipeline', async () => {
      // Mock the database to return deals
      const mockDeals = [
        {
          id: 1,
          pipeline_id: 1,
          stage_id: 1,
          title: 'Enterprise Software License',
          value: 15000
        },
        {
          id: 2,
          pipeline_id: 1,
          stage_id: 2,
          title: 'Consulting Services',
          value: 8500
        }
      ];
      
      db.all.mockResolvedValue(mockDeals);
      
      // Call the method
      const result = await Deal.findByPipeline(1, 1); // pipeline_id, organization_id
      
      // Assertions
      expect(db.all).toHaveBeenCalled();
      expect(result).toEqual(mockDeals);
    });
  });
  
  describe('Deal.update', () => {
    it('should update an existing deal', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Test data
      const dealData = {
        title: 'Updated Enterprise Software License',
        value: 20000,
        probability: 85
      };
      
      // Call the method
      const result = await Deal.update(1, 1, dealData); // deal_id, organization_id, data
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if deal does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Test data
      const dealData = {
        title: 'Updated Deal'
      };
      
      // Call the method and expect it to throw
      await expect(Deal.update(999, 1, dealData)).rejects.toThrow('Deal not found');
    });
  });
  
  describe('Deal.updateStage', () => {
    it('should update the stage of a deal', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1 }); // Deal exists
      db.get.mockResolvedValueOnce({ id: 2, pipeline_id: 1 }); // Stage exists and belongs to same pipeline
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Deal.updateStage(1, 1, 2); // deal_id, organization_id, stage_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if deal does not exist', async () => {
      // Mock the database to simulate deal not found
      db.get.mockResolvedValueOnce(null);
      
      // Call the method and expect it to throw
      await expect(Deal.updateStage(999, 1, 2)).rejects.toThrow('Deal not found');
    });
    
    it('should throw an error if stage does not exist', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, pipeline_id: 1 }); // Deal exists
      db.get.mockResolvedValueOnce(null); // Stage doesn't exist
      
      // Call the method and expect it to throw
      await expect(Deal.updateStage(1, 1, 999)).rejects.toThrow('Stage not found');
    });
    
    it('should throw an error if stage belongs to different pipeline', async () => {
      // Mock the database responses
      db.get.mockResolvedValueOnce({ id: 1, pipeline_id: 1 }); // Deal exists
      db.get.mockResolvedValueOnce({ id: 2, pipeline_id: 2 }); // Stage exists but belongs to different pipeline
      
      // Call the method and expect it to throw
      await expect(Deal.updateStage(1, 1, 2)).rejects.toThrow('Stage belongs to different pipeline');
    });
  });
  
  describe('Deal.delete', () => {
    it('should delete an existing deal', async () => {
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      // Call the method
      const result = await Deal.delete(1, 1); // deal_id, organization_id
      
      // Assertions
      expect(db.run).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should throw an error if deal does not exist', async () => {
      // Mock the database to simulate no changes
      db.run.mockResolvedValue({ changes: 0 });
      
      // Call the method and expect it to throw
      await expect(Deal.delete(999, 1)).rejects.toThrow('Deal not found');
    });
  });
});
