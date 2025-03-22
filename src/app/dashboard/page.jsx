import React from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';

const DashboardPage = () => {
  // Sample data for demonstration
  const recentDeals = [
    { id: '1', title: 'Enterprise Software License', value: '$15,000', stage: 'Negotiation', contact: 'Acme Corp' },
    { id: '2', title: 'Consulting Services', value: '$8,500', stage: 'Proposal', contact: 'TechStart Inc' },
    { id: '3', title: 'Annual Maintenance Contract', value: '$12,000', stage: 'Closed Won', contact: 'Global Systems' },
  ];
  
  const upcomingAppointments = [
    { id: '1', title: 'Product Demo', date: '2025-03-23T10:00:00', contact: 'John Smith' },
    { id: '2', title: 'Contract Review', date: '2025-03-24T14:30:00', contact: 'Sarah Johnson' },
    { id: '3', title: 'Strategy Meeting', date: '2025-03-25T11:00:00', contact: 'Michael Brown' },
  ];
  
  // Column definitions for tables
  const dealColumns = [
    { header: 'Deal', accessor: 'title' },
    { header: 'Value', accessor: 'value' },
    { header: 'Stage', accessor: 'stage' },
    { header: 'Contact', accessor: 'contact' },
    { 
      header: 'Actions', 
      cell: (row) => (
        <Button variant="outline" size="sm">View</Button>
      )
    },
  ];
  
  const appointmentColumns = [
    { header: 'Title', accessor: 'title' },
    { 
      header: 'Date & Time', 
      cell: (row) => {
        const date = new Date(row.date);
        return date.toLocaleString();
      }
    },
    { header: 'Contact', accessor: 'contact' },
    { 
      header: 'Actions', 
      cell: (row) => (
        <Button variant="outline" size="sm">View</Button>
      )
    },
  ];
  
  // Stats for the dashboard
  const stats = [
    { 
      title: 'Total Contacts', 
      value: '1,248', 
      change: '+8.2%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      title: 'Open Deals', 
      value: '42', 
      change: '+12.5%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: 'Revenue', 
      value: '$128,500', 
      change: '+18.3%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      title: 'Email Open Rate', 
      value: '24.8%', 
      change: '-2.5%',
      changeType: 'negative',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
  ];
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-4 sm:mt-0">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Deal
          </Button>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <p className={`ml-2 flex items-center text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      )}
                      <span className="ml-1">{stat.change}</span>
                    </p>
                  )}
                </div>
              </div>
              {stat.icon && (
                <div className="p-3 bg-indigo-50 rounded-md">
                  {stat.icon}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* Recent Deals Section */}
      <div className="mt-8">
        <Card 
          title="Recent Deals" 
          footer={
            <div className="text-center">
              <Button variant="secondary">View All Deals</Button>
            </div>
          }
        >
          <Table 
            columns={dealColumns} 
            data={recentDeals} 
            onRowClick={(row) => console.log('Clicked row:', row)}
          />
        </Card>
      </div>
      
      {/* Upcoming Appointments Section */}
      <div className="mt-8">
        <Card 
          title="Upcoming Appointments" 
          footer={
            <div className="text-center">
              <Button variant="secondary">View All Appointments</Button>
            </div>
          }
        >
          <Table 
            columns={appointmentColumns} 
            data={upcomingAppointments} 
            onRowClick={(row) => console.log('Clicked appointment:', row)}
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
