'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';

const WorkflowsPage = () => {
  // Sample data for demonstration
  const workflows = [
    { 
      id: '1', 
      name: 'New Lead Follow-up', 
      description: 'Automatically follow up with new leads',
      trigger: 'New Contact Created',
      actions: 3,
      is_active: true,
      created_at: '2025-02-15T10:30:00'
    },
    { 
      id: '2', 
      name: 'Deal Stage Update', 
      description: 'Notify team when deal stage changes',
      trigger: 'Deal Stage Changed',
      actions: 2,
      is_active: true,
      created_at: '2025-02-28T14:45:00'
    },
    { 
      id: '3', 
      name: 'Customer Onboarding', 
      description: 'Start onboarding process for new customers',
      trigger: 'Deal Closed Won',
      actions: 5,
      is_active: false,
      created_at: '2025-03-10T09:15:00'
    },
  ];
  
  // Column definitions for workflows table
  const workflowColumns = [
    { header: 'Workflow Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Trigger', accessor: 'trigger' },
    { header: 'Actions', accessor: 'actions' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
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
          <Button variant={row.is_active ? 'danger' : 'secondary'} size="sm">
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    },
  ];
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Workflows"
        description="Automate your business processes with custom workflows"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Workflow
          </Button>
        }
      />
      
      {/* Workflows Table */}
      <Card className="mt-6">
        <Table 
          columns={workflowColumns} 
          data={workflows} 
          onRowClick={(row) => console.log('Clicked workflow:', row)}
        />
      </Card>
      
      {/* Workflow Builder */}
      <Card className="mt-8" title="Workflow Builder">
        <div className="mt-4">
          <div className="mb-6">
            <FormField
              label="Workflow Name"
              name="name"
              placeholder="Enter workflow name"
              value="New Lead Follow-up"
            />
          </div>
          
          <div className="mb-6">
            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Enter workflow description"
              value="Automatically follow up with new leads"
            />
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trigger</h3>
            <Card className="bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">When a new contact is created</h4>
                  <p className="text-sm text-gray-500">This workflow will trigger whenever a new contact is added to the system</p>
                </div>
                <div className="ml-auto">
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Conditions</h3>
              <Button variant="secondary" size="sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Condition
              </Button>
            </div>
            
            <Card className="bg-gray-50 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4 flex-grow">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      name="condition_field"
                      type="select"
                      value="source"
                      options={[
                        { value: 'source', label: 'Source' },
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone' },
                      ]}
                    />
                    <FormField
                      name="condition_operator"
                      type="select"
                      value="equals"
                      options={[
                        { value: 'equals', label: 'Equals' },
                        { value: 'contains', label: 'Contains' },
                        { value: 'starts_with', label: 'Starts with' },
                      ]}
                    />
                    <FormField
                      name="condition_value"
                      value="Website"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              <Button variant="secondary" size="sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Action
              </Button>
            </div>
            
            <Card className="bg-gray-50 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">Send Email</h4>
                  <p className="text-sm text-gray-500 mb-4">Send an automated email to the contact</p>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Email Template"
                      name="email_template"
                      type="select"
                      value="welcome_email"
                      options={[
                        { value: 'welcome_email', label: 'Welcome Email' },
                        { value: 'follow_up', label: 'Follow-up Email' },
                        { value: 'newsletter', label: 'Newsletter' },
                      ]}
                    />
                    <FormField
                      label="Delay"
                      name="delay"
                      type="select"
                      value="immediately"
                      options={[
                        { value: 'immediately', label: 'Immediately' },
                        { value: '1_day', label: 'After 1 day' },
                        { value: '3_days', label: 'After 3 days' },
                        { value: '1_week', label: 'After 1 week' },
                      ]}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gray-50 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">Create Task</h4>
                  <p className="text-sm text-gray-500 mb-4">Create a follow-up task for the sales team</p>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Task Title"
                      name="task_title"
                      value="Follow up with new lead"
                    />
                    <FormField
                      label="Assigned To"
                      name="assigned_to"
                      type="select"
                      value="sales_team"
                      options={[
                        { value: 'sales_team', label: 'Sales Team' },
                        { value: 'john_smith', label: 'John Smith' },
                        { value: 'sarah_johnson', label: 'Sarah Johnson' },
                      ]}
                    />
                    <FormField
                      label="Due Date"
                      name="due_date"
                      type="select"
                      value="3_days"
                      options={[
                        { value: '1_day', label: 'In 1 day' },
                        { value: '3_days', label: 'In 3 days' },
                        { value: '1_week', label: 'In 1 week' },
                        { value: '2_weeks', label: 'In 2 weeks' },
                      ]}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">Add Tag</h4>
                  <p className="text-sm text-gray-500 mb-4">Add a tag to the contact</p>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Tag"
                      name="tag"
                      type="select"
                      value="new_lead"
                      options={[
                        { value: 'new_lead', label: 'New Lead' },
                        { value: 'interested', label: 'Interested' },
                        { value: 'hot_lead', label: 'Hot Lead' },
                        { value: 'customer', label: 'Customer' },
                      ]}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button variant="outline">Cancel</Button>
            <div className="flex space-x-3">
              <FormField
                label="Activate workflow"
                name="is_active"
                type="checkbox"
                checked={true}
              />
              <Button>Save Workflow</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowsPage;
