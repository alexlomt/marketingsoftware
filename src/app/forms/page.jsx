'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';

const FormsPage = () => {
  // Sample data for demonstration
  const forms = [
    { 
      id: '1', 
      title: 'Contact Request Form', 
      description: 'General contact form for website visitors',
      fields: 8,
      submissions: 124,
      is_published: true,
      created_at: '2025-02-10T14:30:00'
    },
    { 
      id: '2', 
      title: 'Event Registration', 
      description: 'Registration form for upcoming webinar',
      fields: 12,
      submissions: 87,
      is_published: true,
      created_at: '2025-02-25T09:15:00'
    },
    { 
      id: '3', 
      title: 'Customer Feedback', 
      description: 'Survey form for product feedback',
      fields: 15,
      submissions: 0,
      is_published: false,
      created_at: '2025-03-15T11:45:00'
    },
  ];
  
  // Column definitions for forms table
  const formColumns = [
    { header: 'Form Title', accessor: 'title' },
    { header: 'Description', accessor: 'description' },
    { header: 'Fields', accessor: 'fields' },
    { header: 'Submissions', accessor: 'submissions' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.is_published ? 'Published' : 'Draft'}
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
          {row.is_published && (
            <Button variant="outline" size="sm">Share</Button>
          )}
        </div>
      )
    },
  ];
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Forms"
        description="Create and manage your forms and surveys"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Form
          </Button>
        }
      />
      
      {/* Forms Table */}
      <Card className="mt-6">
        <Table 
          columns={formColumns} 
          data={forms} 
          onRowClick={(row) => console.log('Clicked form:', row)}
        />
      </Card>
      
      {/* Form Builder Preview */}
      <div className="mt-8">
        <Card title="Form Builder">
          <div className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Contact Request Form</h3>
                <p className="text-sm text-gray-500">Please fill out the form below to get in touch with us.</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    label="First Name"
                    name="first_name"
                    placeholder="Enter your first name"
                    required
                  />
                  <FormField
                    label="Last Name"
                    name="last_name"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
                
                <FormField
                  label="Phone Number"
                  name="phone"
                  placeholder="Enter your phone number"
                />
                
                <FormField
                  label="How did you hear about us?"
                  name="source"
                  type="select"
                  placeholder="Please select"
                  options={[
                    { value: 'search', label: 'Search Engine' },
                    { value: 'social', label: 'Social Media' },
                    { value: 'referral', label: 'Referral' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                
                <FormField
                  label="Message"
                  name="message"
                  type="textarea"
                  placeholder="Enter your message"
                  required
                />
                
                <FormField
                  label="Subscribe to newsletter"
                  name="subscribe"
                  type="checkbox"
                />
                
                <div className="pt-4">
                  <Button>Submit</Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <div>
              <Button variant="outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Form
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </Button>
              <Button variant="outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Get Embed Code
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Form Submissions */}
      <div className="mt-8">
        <Card title="Recent Submissions" description="Contact Request Form">
          <div className="mt-4">
            <Table 
              columns={[
                { header: 'Date', cell: () => new Date().toLocaleDateString() },
                { header: 'Name', cell: () => 'John Doe' },
                { header: 'Email', cell: () => 'john.doe@example.com' },
                { header: 'Phone', cell: () => '(555) 123-4567' },
                { 
                  header: 'Actions', 
                  cell: () => (
                    <Button variant="outline" size="sm">View</Button>
                  )
                },
              ]} 
              data={Array(3).fill({})}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FormsPage;
