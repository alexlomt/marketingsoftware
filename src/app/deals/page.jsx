import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';

const DealsPage = () => {
  // Sample data for demonstration
  const deals = [
    { 
      id: '1', 
      title: 'Enterprise Software License', 
      value: '$15,000', 
      pipeline: 'Sales Pipeline',
      stage: 'Negotiation', 
      contact: 'Acme Corp',
      probability: 75,
      expected_close_date: '2025-04-15'
    },
    { 
      id: '2', 
      title: 'Consulting Services', 
      value: '$8,500', 
      pipeline: 'Sales Pipeline',
      stage: 'Proposal', 
      contact: 'TechStart Inc',
      probability: 50,
      expected_close_date: '2025-04-30'
    },
    { 
      id: '3', 
      title: 'Annual Maintenance Contract', 
      value: '$12,000', 
      pipeline: 'Customer Onboarding',
      stage: 'Closed Won', 
      contact: 'Global Systems',
      probability: 100,
      expected_close_date: '2025-03-20'
    },
  ];
  
  // Column definitions for deals table
  const dealColumns = [
    { header: 'Deal', accessor: 'title' },
    { header: 'Value', accessor: 'value' },
    { header: 'Pipeline', accessor: 'pipeline' },
    { header: 'Stage', accessor: 'stage' },
    { header: 'Contact', accessor: 'contact' },
    { 
      header: 'Probability', 
      cell: (row) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${row.probability}%` }}
          ></div>
        </div>
      )
    },
    { 
      header: 'Expected Close', 
      cell: (row) => {
        const date = new Date(row.expected_close_date);
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
        title="Deals"
        description="Manage your sales opportunities and track progress"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Deal
          </Button>
        }
      />
      
      {/* Filters */}
      <Card className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <FormField
            label="Search"
            name="search"
            placeholder="Search deals..."
          />
          <FormField
            label="Pipeline"
            name="pipeline"
            type="select"
            placeholder="Select pipeline"
            options={[
              { value: 'sales', label: 'Sales Pipeline' },
              { value: 'onboarding', label: 'Customer Onboarding' },
              { value: 'partner', label: 'Partner Program' },
            ]}
          />
          <FormField
            label="Stage"
            name="stage"
            type="select"
            placeholder="Select stage"
            options={[
              { value: 'qualification', label: 'Qualification' },
              { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'closed_won', label: 'Closed Won' },
              { value: 'closed_lost', label: 'Closed Lost' },
            ]}
          />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Deals Table */}
      <Card className="mt-6">
        <Table 
          columns={dealColumns} 
          data={deals} 
          onRowClick={(row) => console.log('Clicked deal:', row)}
        />
      </Card>
      
      {/* Deal Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Deal Value by Stage">
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Qualification</span>
                <span className="text-sm font-medium text-gray-900">$5,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Proposal</span>
                <span className="text-sm font-medium text-gray-900">$8,500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Negotiation</span>
                <span className="text-sm font-medium text-gray-900">$15,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Closed Won</span>
                <span className="text-sm font-medium text-gray-900">$12,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Recent Activities">
          <div className="mt-4 space-y-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Deal created: Annual Maintenance Contract</p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Stage updated: Enterprise Software License</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Note added: Consulting Services</p>
                <p className="text-sm text-gray-500">5 days ago</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Deal Forecast">
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">This Month</span>
              <span className="text-sm font-medium text-gray-900">$15,000</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Next Month</span>
              <span className="text-sm font-medium text-gray-900">$23,500</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Q2 2025</span>
              <span className="text-sm font-medium text-gray-900">$78,000</span>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Weighted Pipeline</span>
                <span className="text-sm font-medium text-gray-900">$35,500</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DealsPage;
