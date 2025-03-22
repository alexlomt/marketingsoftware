import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';

const ContactsPage = () => {
  // Sample data for demonstration
  const contacts = [
    { 
      id: '1', 
      first_name: 'John', 
      last_name: 'Smith', 
      email: 'john.smith@example.com', 
      phone: '(555) 123-4567',
      status: 'Active',
      tags: ['Customer', 'VIP']
    },
    { 
      id: '2', 
      first_name: 'Sarah', 
      last_name: 'Johnson', 
      email: 'sarah.johnson@example.com', 
      phone: '(555) 987-6543',
      status: 'Active',
      tags: ['Lead']
    },
    { 
      id: '3', 
      first_name: 'Michael', 
      last_name: 'Brown', 
      email: 'michael.brown@example.com', 
      phone: '(555) 456-7890',
      status: 'Inactive',
      tags: ['Customer']
    },
  ];
  
  // Column definitions for contacts table
  const contactColumns = [
    { 
      header: 'Name', 
      cell: (row) => `${row.first_name} ${row.last_name}`
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Tags', 
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )
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
        title="Contacts"
        description="Manage your contacts and leads"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Contact
          </Button>
        }
      />
      
      {/* Filters */}
      <Card className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <FormField
            label="Search"
            name="search"
            placeholder="Search contacts..."
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            placeholder="Select status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <FormField
            label="Tag"
            name="tag"
            type="select"
            placeholder="Select tag"
            options={[
              { value: 'customer', label: 'Customer' },
              { value: 'lead', label: 'Lead' },
              { value: 'vip', label: 'VIP' },
            ]}
          />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Contacts Table */}
      <Card className="mt-6">
        <Table 
          columns={contactColumns} 
          data={contacts} 
          onRowClick={(row) => console.log('Clicked contact:', row)}
        />
      </Card>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">3</span> results
          </span>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" disabled>Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
