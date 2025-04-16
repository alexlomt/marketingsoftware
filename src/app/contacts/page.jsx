'use client';

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import Link from 'next/link'; // For potential links in actions
import {
    ChevronLeft,
    ChevronRight,
    Copy,
    CreditCard,
    MoreVertical,
    Truck,
    File, // Added for Export action
    PlusCircle, // Added for Add Contact button
    UserPlus, // Added for Add Contact button alternative
    ListFilter, // Added for Filters button
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis, // If implementing complex pagination
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress"; // Might be useful elsewhere
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"; // Useful for filtering/segmenting
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose, // Added for closing dialog
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // For row selection

// Placeholder for Add/Edit Contact Form component
// You would create this separately
const ContactForm = ({ contact, onSave, onCancel }) => {
    // Form logic here... uses Input, Button, etc.
    return (
        <div className="grid gap-4 py-4">
            <p>Contact form placeholder for {contact ? contact.id : 'new contact'}.</p>
            <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="name" className="text-right">Name</Label>
                 <Input id="name" defaultValue={contact?.first_name} className="col-span-3" />
             </div>
            <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="email" className="text-right">Email</Label>
                 <Input id="email" type="email" defaultValue={contact?.email} className="col-span-3" />
             </div>
             {/* Add other fields as needed */}
        </div>
    )
}


const ContactsPage = () => {
    // TODO: Replace with actual API call and state management (useState, useEffect, etc.)
    const [contacts, setContacts] = useState([
        { id: '1', first_name: 'John', last_name: 'Smith', email: 'john.smith@example.com', phone: '(555) 123-4567', status: 'Active', tags: ['Customer', 'VIP'] },
        { id: '2', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@example.com', phone: '(555) 987-6543', status: 'Active', tags: ['Lead'] },
        { id: '3', first_name: 'Michael', last_name: 'Brown', email: 'michael.brown@example.com', phone: '(555) 456-7890', status: 'Inactive', tags: ['Customer'] },
        { id: '4', first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@example.com', phone: '(555) 555-5555', status: 'Active', tags: ['Prospect'] },
        { id: '5', first_name: 'David', last_name: 'Wilson', email: 'david.wilson@example.com', phone: '(555) 111-2222', status: 'Active', tags: ['Lead', 'High Priority'] },
    ]);
    const [isLoading, setIsLoading] = useState(false); // For loading state
    const [error, setError] = useState(null); // For errors
    const [selectedContact, setSelectedContact] = useState(null); // For editing
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false); // Dialog state

    // Function to handle opening the edit dialog
    const handleEdit = (contact) => {
        setSelectedContact(contact);
        setIsAddEditDialogOpen(true);
    }

    // Function to handle opening the add dialog
    const handleAdd = () => {
        setSelectedContact(null); // Clear selected contact for adding
        setIsAddEditDialogOpen(true);
    }
    
    // Function to handle saving (placeholder)
    const handleSaveContact = (formData) => {
        console.log("Saving contact:", formData, selectedContact?.id);
        // TODO: Implement API call to save contact
        setIsAddEditDialogOpen(false); // Close dialog on save
    }

    // Function to handle delete (placeholder)
    const handleDelete = (contactId) => {
        console.log("Deleting contact:", contactId);
        // TODO: Implement API call to delete contact
        // Example: setContacts(contacts.filter(c => c.id !== contactId));
    }


    // Fetch data example (replace with your actual fetching logic)
    // useEffect(() => {
    //   const fetchContacts = async () => {
    //     setIsLoading(true);
    //     setError(null);
    //     try {
    //       const response = await fetch('/api/contacts'); // Adjust API endpoint
    //       if (!response.ok) throw new Error('Failed to fetch contacts');
    //       const data = await response.json();
    //       setContacts(data.contacts); 
    //     } catch (err) {
    //       setError(err.message);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };
    //   fetchContacts();
    // }, []);


    return (
         <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Tabs defaultValue="all"> {/* Or manage active tab state */}
                    <div className="flex items-center">
                        {/* Optional Tabs for segments */}
                        {/* <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="inactive">Inactive</TabsTrigger>
                        </TabsList> */}
                         <h1 className="text-lg font-semibold md:text-2xl">Contacts</h1>
                        <div className="ml-auto flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 gap-1">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                            Filter
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked>
                                        Active
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
                                    {/* Add more filters */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" variant="outline" className="h-7 gap-1">
                                <File className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Export
                                </span>
                            </Button>
                            {/* Changed to trigger Dialog */}
                            <DialogTrigger asChild> 
                                <Button size="sm" className="h-7 gap-1" onClick={handleAdd}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Add Contact
                                    </span>
                                </Button>
                             </DialogTrigger>
                        </div>
                    </div>
                    {/* Content for the active tab */}
                    <TabsContent value="all"> 
                        <Card>
                            <CardHeader>
                                <CardTitle>All Contacts</CardTitle>
                                <CardDescription>
                                    Manage your contacts and view their details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="hidden w-[100px] sm:table-cell">
                                                {/* <Checkbox /> Optional: Select All */}
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Email
                                            </TableHead>
                                             <TableHead className="hidden md:table-cell">
                                                Phone
                                            </TableHead>
                                            <TableHead>
                                                <span className="sr-only">Actions</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                     {isLoading && ( /* Basic Loading Indicator */
                                         <TableRow>
                                             <TableCell colSpan={6} className="text-center">Loading contacts...</TableCell>
                                         </TableRow>
                                     )}
                                     {error && ( /* Basic Error Indicator */
                                         <TableRow>
                                             <TableCell colSpan={6} className="text-center text-red-600">Error: {error}</TableCell>
                                         </TableRow>
                                     )}
                                        {!isLoading && !error && contacts.map((contact) => (
                                            <TableRow key={contact.id}>
                                                <TableCell className="hidden sm:table-cell">
                                                    {/* <Checkbox /> Optional: Row Selection */}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {contact.first_name} {contact.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={contact.status === 'Active' ? "default" : "outline"}>
                                                        {contact.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {contact.email}
                                                </TableCell>
                                                 <TableCell className="hidden md:table-cell">
                                                    {contact.phone || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            {/* Trigger Edit Dialog */}
                                                            <DialogTrigger asChild>
                                                                <DropdownMenuItem onClick={() => handleEdit(contact)}>Edit</DropdownMenuItem>
                                                            </DialogTrigger>
                                                            <DropdownMenuItem onClick={() => handleDelete(contact.id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {!isLoading && !error && contacts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">No contacts found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter>
                                <div className="text-xs text-muted-foreground">
                                    Showing <strong>1-{contacts.length}</strong> of <strong>{contacts.length}</strong>{" "}
                                    contacts
                                </div>
                                {/* Optional: Add Pagination component here if needed */}
                                {/* <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                                        <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                                    </PaginationContent>
                                </Pagination> */}
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

             {/* Add/Edit Dialog Content */}
             <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                     <DialogTitle>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                     <DialogDescription>
                         {selectedContact ? 'Make changes to the contact details.' : 'Enter the details for the new contact.'}
                     </DialogDescription>
                 </DialogHeader>
                  <ContactForm 
                    contact={selectedContact} 
                    onSave={handleSaveContact} 
                    onCancel={() => setIsAddEditDialogOpen(false)} 
                  />
                 <DialogFooter>
                    {/* Add Save/Cancel buttons inside the ContactForm or handle saving logic there */} 
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    {/* <Button type="submit" form="contact-form-id">Save changes</Button> */}
                 </DialogFooter>
             </DialogContent>
         </Dialog>
    );
};

export default ContactsPage;
