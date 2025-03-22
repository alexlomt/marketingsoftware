import React from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Card from '@/components/Card';
import FormField from '@/components/FormField';

const AppointmentsPage = () => {
  // Sample data for demonstration
  const appointments = [
    { 
      id: '1', 
      title: 'Product Demo', 
      contact: 'John Smith',
      start_time: '2025-03-23T10:00:00',
      end_time: '2025-03-23T11:00:00',
      location: 'Zoom Meeting',
      status: 'Scheduled'
    },
    { 
      id: '2', 
      title: 'Contract Review', 
      contact: 'Sarah Johnson',
      start_time: '2025-03-24T14:30:00',
      end_time: '2025-03-24T15:30:00',
      location: 'Office - Conference Room A',
      status: 'Confirmed'
    },
    { 
      id: '3', 
      title: 'Strategy Meeting', 
      contact: 'Michael Brown',
      start_time: '2025-03-25T11:00:00',
      end_time: '2025-03-25T12:00:00',
      location: 'Google Meet',
      status: 'Pending'
    },
  ];
  
  // Column definitions for appointments table
  const appointmentColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Contact', accessor: 'contact' },
    { 
      header: 'Date & Time', 
      cell: (row) => {
        const start = new Date(row.start_time);
        const end = new Date(row.end_time);
        return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    },
    { header: 'Location', accessor: 'location' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
          row.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
          row.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
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
  
  // Days of the week for calendar
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate calendar days for current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Appointments"
        description="Schedule and manage your meetings and appointments"
        actions={
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Schedule Appointment
          </Button>
        }
      />
      
      {/* Calendar View */}
      <Card className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {/* Calendar header (days of week) */}
          {daysOfWeek.map((day, index) => (
            <div key={index} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`bg-white min-h-[100px] p-2 ${
                day === today.getDate() ? 'bg-indigo-50' : ''
              }`}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium ${
                    day === today.getDate() ? 'text-indigo-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  
                  {/* Sample appointments for demonstration */}
                  {day === 23 && (
                    <div className="mt-1 text-xs bg-blue-100 text-blue-800 p-1 rounded truncate">
                      10:00 AM - Product Demo
                    </div>
                  )}
                  {day === 24 && (
                    <div className="mt-1 text-xs bg-green-100 text-green-800 p-1 rounded truncate">
                      2:30 PM - Contract Review
                    </div>
                  )}
                  {day === 25 && (
                    <div className="mt-1 text-xs bg-yellow-100 text-yellow-800 p-1 rounded truncate">
                      11:00 AM - Strategy Meeting
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      {/* Upcoming Appointments */}
      <Card className="mt-8" title="Upcoming Appointments">
        <Table 
          columns={appointmentColumns} 
          data={appointments} 
          onRowClick={(row) => console.log('Clicked appointment:', row)}
        />
      </Card>
      
      {/* Appointment Form Preview */}
      <Card className="mt-8" title="Schedule New Appointment">
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Title"
            name="title"
            placeholder="Enter appointment title"
            required
          />
          <FormField
            label="Contact"
            name="contact"
            type="select"
            placeholder="Select contact"
            options={[
              { value: 'john_smith', label: 'John Smith' },
              { value: 'sarah_johnson', label: 'Sarah Johnson' },
              { value: 'michael_brown', label: 'Michael Brown' },
            ]}
            required
          />
          <FormField
            label="Start Date & Time"
            name="start_time"
            type="datetime-local"
            required
          />
          <FormField
            label="End Date & Time"
            name="end_time"
            type="datetime-local"
            required
          />
          <FormField
            label="Location"
            name="location"
            placeholder="Enter location or meeting link"
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
            ]}
            required
          />
          <div className="sm:col-span-2">
            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              placeholder="Enter any additional notes"
            />
          </div>
          <div className="sm:col-span-2">
            <FormField
              label="Send reminder"
              name="send_reminder"
              type="checkbox"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button>Schedule Appointment</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentsPage;
