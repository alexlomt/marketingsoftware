'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { format } from 'date-fns';
import {
    MoreVertical,
    PlusCircle,
    Calendar as CalendarIcon, // For icon buttons
    CheckCircle, // For status
    Clock, // For status
    AlertTriangle, // For status
    ChevronLeft,
    ChevronRight,
    Edit, // Added
    Trash2, // Added
    Loader2 // Added
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar component
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // For form
import { Textarea } from "@/components/ui/textarea"; // For form
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation'; // Added

// Placeholder for Add/Edit Appointment Form component
const AppointmentForm = ({ appointment, onSave, onCancel }) => {
    // State for form fields
    const [title, setTitle] = useState(appointment?.title || '');
    const [contact, setContact] = useState(appointment?.contact || ''); // Needs to fetch/select contacts
    const [startTime, setStartTime] = useState(appointment?.start_time || '');
    const [endTime, setEndTime] = useState(appointment?.end_time || '');
    const [location, setLocation] = useState(appointment?.location || '');
    const [status, setStatus] = useState(appointment?.status || 'Scheduled');
    const [notes, setNotes] = useState(appointment?.notes || '');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation example
        if (!title || !contact || !startTime || !endTime || !status) {
            alert('Please fill in all required fields (Title, Contact, Start, End, Status).');
            return;
        }
        onSave({ 
            title,
            contact, // This should ideally be a contact ID
            start_time: startTime,
            end_time: endTime,
            location,
            status,
            notes 
        }, appointment?.id);
    }
    
    return (
        <form id="appointment-form" onSubmit={handleSubmit} className="grid gap-4 py-4 sm:grid-cols-2">
             <div className="grid gap-1.5 sm:col-span-2">
                 <Label htmlFor="appt-title">Title</Label>
                 <Input id="appt-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
             </div>
              <div className="grid gap-1.5 sm:col-span-2">
                 <Label htmlFor="appt-contact">Contact</Label>
                 {/* TODO: Replace with a searchable select/combobox for contacts */}
                 <Input id="appt-contact" value={contact} onChange={(e) => setContact(e.target.value)} required placeholder="Select or type contact..."/>
             </div>
            <div className="grid gap-1.5">
                 <Label htmlFor="appt-start">Start Time</Label>
                 <Input id="appt-start" type="datetime-local" value={startTime ? format(new Date(startTime), "yyyy-MM-dd'T'HH:mm") : ''} onChange={(e) => setStartTime(e.target.value)} required />
             </div>
             <div className="grid gap-1.5">
                 <Label htmlFor="appt-end">End Time</Label>
                 <Input id="appt-end" type="datetime-local" value={endTime ? format(new Date(endTime), "yyyy-MM-dd'T'HH:mm") : ''} onChange={(e) => setEndTime(e.target.value)} required />
             </div>
             <div className="grid gap-1.5 sm:col-span-2">
                 <Label htmlFor="appt-location">Location</Label>
                 <Input id="appt-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Zoom Link, Office Address"/>
             </div>
             <div className="grid gap-1.5 sm:col-span-2">
                 <Label htmlFor="appt-status">Status</Label>
                  <Select value={status} onValueChange={setStatus} required>
                     <SelectTrigger id="appt-status">
                         <SelectValue placeholder="Select status" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="Scheduled">Scheduled</SelectItem>
                         <SelectItem value="Confirmed">Confirmed</SelectItem>
                         <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                     </SelectContent>
                 </Select>
             </div>
             <div className="grid gap-1.5 sm:col-span-2">
                 <Label htmlFor="appt-notes">Notes</Label>
                 <Textarea id="appt-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="(Optional) Add notes..."/>
             </div>
             {/* Hidden button to allow form submission via Enter key */}
             <button type="submit" className="hidden" />
        </form>
    )
}


const AppointmentsPage = () => {
    const router = useRouter();
    // TODO: Replace with actual API data fetching
    const [appointments, setAppointments] = useState([
        { id: '1', title: 'Product Demo', contact: 'John Smith', start_time: '2025-03-23T10:00:00', end_time: '2025-03-23T11:00:00', location: 'Zoom Meeting', status: 'Scheduled', notes: '' },
        { id: '2', title: 'Contract Review', contact: 'Sarah Johnson', start_time: '2025-03-24T14:30:00', end_time: '2025-03-24T15:30:00', location: 'Office - Conference Room A', status: 'Confirmed', notes: 'Bring contract draft v3' },
        { id: '3', title: 'Strategy Meeting', contact: 'Michael Brown', start_time: '2025-03-25T11:00:00', end_time: '2025-03-25T12:00:00', location: 'Google Meet', status: 'Pending', notes: '' },
    ]);
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null); 
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date()); 

    // --- Data Fetching --- 
     const loadAppointments = useCallback(async () => {
         setIsLoading(true);
         setError(null);
         try {
             // TODO: Replace with actual API call
             console.log("Fetching appointments...");
             // const response = await fetch('/api/appointments'); // Example
             // if (!response.ok) throw new Error('Failed to fetch');
             // const data = await response.json();
             // setAppointments(data.appointments || []);
             await new Promise(res => setTimeout(res, 500)); // Simulate delay
             console.log("Appointments loaded (mocked)");
         } catch (err) {
             console.error("Failed to load appointments:", err);
             setError(err.message);
             setAppointments([]);
         } finally {
             setIsLoading(false);
         }
     }, []);

     useEffect(() => {
         loadAppointments();
     }, [loadAppointments]);

    // --- Actions --- 
    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setIsAddEditDialogOpen(true);
    }

    const handleAdd = () => {
        setSelectedAppointment(null);
        setIsAddEditDialogOpen(true);
    }
    
    const handleSaveAppointment = async (formData, appointmentId = null) => {
        setIsSaving(true);
        setError(null); // Clear previous errors
        const isEditing = !!appointmentId;
        const url = isEditing ? `/api/appointments/${appointmentId}` : '/api/appointments';
        const method = isEditing ? 'PUT' : 'POST';

        console.log(`Saving appointment (${method})...`, { url, formData });
        try {
             // TODO: Replace with actual API call
             // const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
             // if (!response.ok) { ... handle error ... }
             // const savedAppointment = await response.json();
             await new Promise(res => setTimeout(res, 1000)); // Simulate save
             const savedAppointment = { // Simulate response
                 id: appointmentId || `new_${Date.now()}`,
                 ...formData,
                 start_time: new Date(formData.start_time).toISOString(), // Ensure ISO format if needed
                 end_time: new Date(formData.end_time).toISOString(),
             };

            setIsAddEditDialogOpen(false);
            loadAppointments(); // Refetch data after saving
            alert(`Appointment ${isEditing ? 'updated' : 'scheduled'} successfully! (simulated)`);

        } catch (err) {
             console.error(`Error saving appointment:`, err);
             setError(`Failed to save appointment: ${err.message}`); // Set error state
              alert(`Error saving appointment: ${err.message}`);
             // Keep dialog open by not calling setIsAddEditDialogOpen(false) on error?
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async (appointmentId) => {
         if (!confirm('Are you sure you want to delete this appointment?')) return;
         console.log("Deleting appointment:", appointmentId);
         setError(null);
         // TODO: Add specific loading state for delete?
         try {
             // TODO: Replace with actual API call
             // const response = await fetch(`/api/appointments/${appointmentId}`, { method: 'DELETE' });
             // if (!response.ok) { ... handle error ... }
             await new Promise(res => setTimeout(res, 500)); // Simulate delete

             console.log("Appointment deleted successfully (simulated)");
             loadAppointments(); // Refetch data
         } catch (err) {
             console.error("Error deleting appointment:", err);
             setError(`Failed to delete appointment: ${err.message}`);
             alert(`Error deleting appointment: ${err.message}`);
         }
    }
    
    const goToPreviousMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const goToNextMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const goToToday = () => setCalendarDate(new Date());

     const appointmentsForSelectedDate = appointments.filter(appt => 
         format(new Date(appt.start_time), 'yyyy-MM-dd') === format(calendarDate, 'yyyy-MM-dd')
     );

    return (
        <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => { if (!isSaving) setIsAddEditDialogOpen(isOpen); }}>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                
                {/* Left Column: Calendar + Selected Day's Appointments */} 
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                    <div className="flex items-center">
                         <h1 className="text-lg font-semibold md:text-2xl">Appointments</h1>
                         <div className="ml-auto flex items-center gap-2">
                             <DialogTrigger asChild>
                                <Button size="sm" className="h-8 gap-1" onClick={handleAdd}>
                                    <PlusCircle className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Schedule Appointment
                                    </span>
                                </Button>
                             </DialogTrigger>
                         </div>
                    </div>

                    {/* Display Page Errors */} 
                     {error && !isAddEditDialogOpen && (
                        <Card className="border-destructive bg-destructive/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-destructive">Error</CardTitle>
                                 <AlertTriangle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-destructive">{error}</p>
                                 <Button variant="ghost" size="sm" onClick={loadAppointments} className="mt-2 text-destructive hover:text-destructive">Retry</Button>
                            </CardContent>
                        </Card>
                     )}

                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle>{format(calendarDate, 'MMMM yyyy')}</CardTitle>
                             <div className="flex items-center gap-1">
                                 <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToPreviousMonth}>
                                      <ChevronLeft className="h-4 w-4" />
                                      <span className="sr-only">Previous Month</span>
                                 </Button>
                                  <Button variant="outline" size="sm" className="h-7 px-2" onClick={goToToday}>Today</Button>
                                 <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToNextMonth}>
                                      <ChevronRight className="h-4 w-4" />
                                     <span className="sr-only">Next Month</span>
                                 </Button>
                             </div>
                         </CardHeader>
                         <CardContent className="p-0">
                             <Calendar
                                mode="single"
                                selected={calendarDate}
                                onSelect={(day) => setCalendarDate(day || new Date())}
                                month={calendarDate}
                                onMonthChange={setCalendarDate}
                                className="p-3 rounded-md w-full" // Adjusted styling 
                                disabled={isLoading} // Disable while loading
                             />
                         </CardContent>
                     </Card>

                     <Card>
                         <CardHeader>
                             <CardTitle>Schedule for {format(calendarDate, 'PPP')}</CardTitle>
                              <CardDescription>Appointments on the selected date.</CardDescription>
                         </CardHeader>
                         <CardContent className="grid gap-4">
                              {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
                              {!isLoading && appointmentsForSelectedDate.length === 0 && (
                                 <p className="text-sm text-muted-foreground text-center py-4">No appointments scheduled for this date.</p>
                              )}
                              {!isLoading && appointmentsForSelectedDate.map(appt => (
                                 <div key={appt.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                     <div className="grid gap-1 flex-1">
                                         <p className="text-sm font-medium leading-none flex items-center">
                                              <Clock className="h-3 w-3 mr-1.5 text-muted-foreground"/> 
                                             {format(new Date(appt.start_time), 'p')} - {format(new Date(appt.end_time), 'p')}
                                         </p>
                                         <p className="text-sm font-semibold leading-none mt-1">{appt.title}</p>
                                         <p className="text-sm text-muted-foreground">with {appt.contact}</p>
                                          {appt.location && <p className="text-xs text-muted-foreground flex items-center mt-1"><MapPin className="h-3 w-3 mr-1"/>{appt.location}</p>}
                                     </div>
                                      <Badge variant={ 
                                            appt.status === 'Confirmed' ? 'default' : 
                                            appt.status === 'Scheduled' ? 'secondary' : 'outline'
                                        } className="self-start">{appt.status}</Badge>
                                      <DialogTrigger asChild>
                                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(appt)}>
                                             <Edit className="h-3.5 w-3.5" />
                                             <span className="sr-only">Edit</span>
                                         </Button>
                                     </DialogTrigger>
                                 </div>
                              ))}
                         </CardContent>
                     </Card>
                </div>

                {/* Right Column: Upcoming Appointments List */} 
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Upcoming List</CardTitle>
                            <CardDescription>
                                All scheduled and pending appointments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[600px] overflow-y-auto"> {/* Limit height and scroll */} 
                            <Table>
                                {/* <TableHeader>
                                    <TableRow>
                                        <TableHead>Details</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader> */} 
                                <TableBody>
                                   {isLoading && (
                                       <TableRow><TableCell colSpan={2} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                                   )}
                                   {error && (
                                        <TableRow><TableCell colSpan={2} className="text-center text-destructive py-10">Error: {error}</TableCell></TableRow>
                                   )}
                                    {!isLoading && !error && appointments.map((appt) => (
                                        <TableRow key={appt.id}>
                                            <TableCell>
                                                 <div className="font-medium">{appt.title}</div>
                                                 <div className="text-xs text-muted-foreground">{appt.contact}</div>
                                                 <div className="text-xs text-muted-foreground">
                                                    {format(new Date(appt.start_time), 'PPp')} 
                                                 </div>
                                                  <Badge variant={ 
                                                        appt.status === 'Confirmed' ? 'default' : 
                                                        appt.status === 'Scheduled' ? 'secondary' : 'outline'
                                                    } className="mt-1">{appt.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                         <DialogTrigger asChild>
                                                             <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEdit(appt); }}> 
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                         </DialogTrigger>
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuSeparator/>
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => handleDelete(appt.id)}
                                                        >
                                                             <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                     {!isLoading && !error && appointments.length === 0 && (
                                        <TableRow><TableCell colSpan={2} className="text-center py-10">No upcoming appointments.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>

             {/* Add/Edit Dialog Content */} 
             <DialogContent className="sm:max-w-lg"> 
                 <DialogHeader>
                     <DialogTitle>{selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
                     <DialogDescription>
                         {selectedAppointment ? 'Update the appointment details.' : 'Fill in the details to schedule a new appointment.'}
                     </DialogDescription>
                 </DialogHeader>
                  <AppointmentForm 
                    key={selectedAppointment ? selectedAppointment.id : 'new'}
                    appointment={selectedAppointment} 
                    onSave={handleSaveAppointment} 
                    onCancel={() => setIsAddEditDialogOpen(false)} 
                  />
                 <DialogFooter>
                     {error && isAddEditDialogOpen && (
                        <p className="text-sm text-destructive mr-auto">Error: {error}</p> 
                     )}
                    <DialogClose asChild>
                         <Button type="button" variant="secondary" disabled={isSaving}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" form="appointment-form" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSaving ? 'Saving...' : (selectedAppointment ? 'Save Changes' : 'Schedule')}
                    </Button> 
                 </DialogFooter>
             </DialogContent>
         </Dialog>
    );
};

export default AppointmentsPage;
