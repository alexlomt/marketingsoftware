'use client';

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import Link from 'next/link';
import { format } from 'date-fns';
import {
    MoreVertical,
    File,
    PlusCircle,
    ListFilter,
    Eye, // For View Submissions
    Share2, // For Share/Embed
    Edit, // For Edit
    Trash2, // For Delete
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
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";

// Placeholder for Add/Edit Form basic details
const FormDetailsForm = ({ form, onSave, onCancel }) => {
    return (
        <div className="grid gap-4 py-4">
            <p>Form details placeholder for {form ? form.id : 'new form'}.</p>
             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="title" className="text-right">Title</Label>
                 <Input id="title" defaultValue={form?.title} className="col-span-3" />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="description" className="text-right">Description</Label>
                 <Input id="description" defaultValue={form?.description} className="col-span-3" />
             </div>
             {/* Add fields for status etc. */}
        </div>
    )
}


const FormsPage = () => {
    // TODO: Replace with actual API data fetching
    const [forms, setForms] = useState([
        { id: '1', title: 'Contact Request Form', description: 'General contact form', fields: 8, submissions: 124, is_published: true, created_at: '2025-02-10T14:30:00' },
        { id: '2', title: 'Event Registration', description: 'Webinar sign-up', fields: 12, submissions: 87, is_published: true, created_at: '2025-02-25T09:15:00' },
        { id: '3', title: 'Customer Feedback', description: 'Product feedback survey', fields: 15, submissions: 0, is_published: false, created_at: '2025-03-15T11:45:00' },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

    // Redirect to form builder (placeholder)
    const goToFormBuilder = (formId = null) => {
        const path = formId ? `/forms/builder/${formId}` : '/forms/builder/new';
        console.log(`Redirecting to form builder: ${path}`);
        // router.push(path); // Use next/navigation router
    }

    const handleEditDetails = (form) => {
        setSelectedForm(form);
        setIsAddEditDialogOpen(true);
    }
    
    const handleSaveFormDetails = (formData) => {
        console.log("Saving form details:", formData, selectedForm?.id);
        setIsAddEditDialogOpen(false);
    }

    const handleDelete = (formId) => {
        console.log("Deleting form:", formId);
    }

     const viewSubmissions = (formId) => {
        console.log("Viewing submissions for form:", formId);
         // router.push(`/forms/${formId}/submissions`);
    }

     const shareForm = (formId) => {
        console.log("Sharing form:", formId);
        // Implement sharing/embed code logic (maybe another dialog)
    }


    return (
        <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Forms</h1>
                    <div className="ml-auto flex items-center gap-2">
                         {/* Add Filters if needed */}
                         <Button size="sm" className="h-7 gap-1" onClick={() => goToFormBuilder()}> 
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Create Form
                            </span>
                        </Button>
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Your Forms</CardTitle>
                        <CardDescription>
                            Create, manage, and view submissions for your forms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden sm:table-cell">Submissions</TableHead>
                                    <TableHead className="hidden md:table-cell">Fields</TableHead>
                                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {isLoading && (
                                   <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                               )}
                               {error && (
                                    <TableRow><TableCell colSpan={6} className="text-center text-red-600">Error: {error}</TableCell></TableRow>
                               )}
                                {!isLoading && !error && forms.map((form) => (
                                    <TableRow key={form.id}>
                                        <TableCell className="font-medium">
                                            {form.title}
                                            <div className="text-xs text-muted-foreground hidden md:block">{form.description}</div>
                                            </TableCell>
                                        <TableCell>
                                             <Badge variant={form.is_published ? "default" : "outline"}>
                                                {form.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{form.submissions}</TableCell>
                                        <TableCell className="hidden md:table-cell">{form.fields}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {format(new Date(form.created_at), 'PP')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                     <DropdownMenuItem onClick={() => viewSubmissions(form.id)}>
                                                        <Eye className="mr-2 h-4 w-4"/> View Submissions
                                                     </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => goToFormBuilder(form.id)}>
                                                         <Edit className="mr-2 h-4 w-4"/> Edit in Builder
                                                    </DropdownMenuItem>
                                                    {form.is_published && (
                                                        <DropdownMenuItem onClick={() => shareForm(form.id)}>
                                                            <Share2 className="mr-2 h-4 w-4"/> Share / Embed
                                                        </DropdownMenuItem>
                                                    )}
                                                     <DialogTrigger asChild>
                                                         <DropdownMenuItem onClick={() => handleEditDetails(form)}>
                                                            Edit Details
                                                         </DropdownMenuItem>
                                                     </DialogTrigger>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-600" 
                                                        onClick={() => handleDelete(form.id)}
                                                     >
                                                         <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && !error && forms.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="text-center">No forms found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-{forms.length}</strong> of <strong>{forms.length}</strong> forms
                        </div>
                         {/* Optional Pagination */}
                    </CardFooter>
                </Card>
            </main>

             {/* Add/Edit Form Details Dialog Content */}
             <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                     <DialogTitle>{selectedForm ? 'Edit Form Details' : 'Create New Form'}</DialogTitle>
                     <DialogDescription>
                         {selectedForm ? 'Update the basic details for this form.' : 'Enter the basic details. You can add fields in the builder.'}
                     </DialogDescription>
                 </DialogHeader>
                  <FormDetailsForm 
                    form={selectedForm} 
                    onSave={handleSaveFormDetails} 
                    onCancel={() => setIsAddEditDialogOpen(false)} 
                  />
                 <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveFormDetails}>Save Details</Button> 
                 </DialogFooter>
             </DialogContent>
         </Dialog>
    );
};

export default FormsPage;
