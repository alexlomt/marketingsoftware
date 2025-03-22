import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';

const EmailCampaignsPage = () => {
  // Sample data for demonstration
  const campaigns = [
    { 
      id: '1', 
      name: 'March Newsletter', 
      subject: 'Your March Update is Here!',
      status: 'Sent',
      recipients: 1248,
      open_rate: '24.8%',
      click_rate: '12.3%',
      sent_date: '2025-03-15T10:00:00'
    },
    { 
      id: '2', 
      name: 'Product Launch Announcement', 
      subject: 'Introducing Our New Product Line',
      status: 'Scheduled',
      recipients: 1500,
      open_rate: '-',
      click_rate: '-',
      sent_date: '2025-04-01T09:00:00'
    },
    { 
      id: '3', 
      name: 'Customer Feedback Survey', 
      subject: 'We Value Your Opinion',
      status: 'Draft',
      recipients: 0,
      open_rate: '-',
      click_rate: '-',
      sent_date: null
    },
  ];
  
  // Column definitions for campaigns table
  const campaignColumns = [
    { header: 'Campaign Name', accessor: 'name' },
    { header: 'Subject', accessor: 'subject' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'Sent' ? 'bg-green-100 text-green-800' : 
          row.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { header: 'Recipients', accessor: 'recipients' },
    { header: 'Open Rate', accessor: 'open_rate' },
    { header: 'Click Rate', accessor: 'click_rate' },
    { 
      header: 'Sent Date', 
      cell: (row) => {
        if (!row.sent_date) return '-';
        const date = new Date(row.sent_date);
        return date.toLocaleString();
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
        title="Email Campaigns"
        description="Create and manage your email marketing campaigns"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Campaign
          </Button>
        }
      />
      
      {/* Filters */}
      <Card className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <FormField
            label="Search"
            name="search"
            placeholder="Search campaigns..."
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            placeholder="Select status"
            options={[
              { value: 'sent', label: 'Sent' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
          <FormField
            label="Date Range"
            name="date_range"
            type="select"
            placeholder="Select range"
            options={[
              { value: 'last_7_days', label: 'Last 7 days' },
              { value: 'last_30_days', label: 'Last 30 days' },
              { value: 'last_90_days', label: 'Last 90 days' },
              { value: 'custom', label: 'Custom range' },
            ]}
          />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Campaigns Table */}
      <Card className="mt-6">
        <Table 
          columns={campaignColumns} 
          data={campaigns} 
          onRowClick={(row) => console.log('Clicked campaign:', row)}
        />
      </Card>
      
      {/* Campaign Analytics */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Email Performance">
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Delivery Rate</span>
                <span className="text-sm font-medium text-gray-900">98.7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '98.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Open Rate</span>
                <span className="text-sm font-medium text-gray-900">24.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '24.8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Click Rate</span>
                <span className="text-sm font-medium text-gray-900">12.3%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '12.3%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Unsubscribe Rate</span>
                <span className="text-sm font-medium text-gray-900">0.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '0.8%' }}></div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Top Performing Campaigns">
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Product Launch Announcement</span>
                <span className="text-sm font-medium text-gray-900">32.5% open</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '32.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Holiday Special Offer</span>
                <span className="text-sm font-medium text-gray-900">28.9% open</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '28.9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Customer Feedback Survey</span>
                <span className="text-sm font-medium text-gray-900">26.2% open</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '26.2%' }}></div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Email Activity">
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Emails Sent (Last 30 days)</span>
              <span className="text-sm font-medium text-gray-900">5,248</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Emails Opened</span>
              <span className="text-sm font-medium text-gray-900">1,302</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Links Clicked</span>
              <span className="text-sm font-medium text-gray-900">645</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Unsubscribes</span>
              <span className="text-sm font-medium text-gray-900">42</span>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active Subscribers</span>
                <span className="text-sm font-medium text-gray-900">12,486</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailCampaignsPage;
