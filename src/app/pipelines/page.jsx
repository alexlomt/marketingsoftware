'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';

const PipelinesPage = () => {
  // Sample data for demonstration
  const pipelines = [
    { 
      id: '1', 
      name: 'Sales Pipeline', 
      stages: 5,
      deals: 12,
      value: '$145,000',
      created_at: '2025-01-15T10:30:00'
    },
    { 
      id: '2', 
      name: 'Customer Onboarding', 
      stages: 4,
      deals: 8,
      value: '$78,500',
      created_at: '2025-02-03T14:45:00'
    },
    { 
      id: '3', 
      name: 'Partner Program', 
      stages: 3,
      deals: 5,
      value: '$52,000',
      created_at: '2025-02-28T09:15:00'
    },
  ];
  
  // Column definitions for pipelines table
  const pipelineColumns = [
    { header: 'Pipeline Name', accessor: 'name' },
    { header: 'Stages', accessor: 'stages' },
    { header: 'Active Deals', accessor: 'deals' },
    { header: 'Total Value', accessor: 'value' },
    { 
      header: 'Created', 
      cell: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleDateString();
      }
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">View</Button>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
      )
    },
  ];
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Pipelines"
        description="Manage your sales pipelines and deal stages"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Pipeline
          </Button>
        }
      />
      
      {/* Pipelines Table */}
      <Card className="mt-6">
        <Table 
          columns={pipelineColumns} 
          data={pipelines} 
          onRowClick={(row) => console.log('Clicked pipeline:', row)}
        />
      </Card>
      
      {/* Pipeline Visualization */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        {pipelines.map((pipeline) => (
          <Card 
            key={pipeline.id}
            title={pipeline.name}
            description={`${pipeline.deals} active deals · ${pipeline.value} total value`}
          >
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Pipeline Stages</span>
                <Button variant="secondary" size="sm">Manage Stages</Button>
              </div>
              
              {/* Sample pipeline visualization */}
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {Array.from({ length: pipeline.stages }).map((_, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-64 bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Stage {index + 1}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {Math.floor(Math.random() * 5)} deals
                      </span>
                    </div>
                    
                    {/* Sample deals in this stage */}
                    {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, dealIndex) => (
                      <div 
                        key={dealIndex}
                        className="bg-white border border-gray-200 rounded p-3 mb-2 shadow-sm"
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">Sample Deal {dealIndex + 1}</div>
                        <div className="text-xs text-gray-500">Contact: Sample Contact</div>
                        <div className="text-xs font-medium text-gray-900 mt-1">${Math.floor(Math.random() * 10000)}</div>
                      </div>
                    ))}
                    
                    <button className="w-full mt-2 text-sm text-indigo-600 hover:text-indigo-500 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Deal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PipelinesPage;
