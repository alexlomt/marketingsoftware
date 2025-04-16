'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    MoreVertical,
    File,
    PlusCircle,
    ListFilter,
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

// Placeholder for Add/Edit Pipeline Form component
const PipelineForm = ({ pipeline, onSave, onCancel }) => {
    return (
        <div className="grid gap-4 py-4">
            <p>Pipeline form placeholder for {pipeline ? pipeline.id : 'new pipeline'}.</p>
             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="name" className="text-right">Name</Label>
                 <Input id="name" defaultValue={pipeline?.name} className="col-span-3" />
             </div>
             {/* Add fields for stages if needed */}
        </div>
    )
}


const PipelinesPage = () => {
    // TODO: Replace with actual API data fetching
    const [pipelines, setPipelines] = useState([
        { id: '1', name: 'Sales Pipeline', stages: 5, deals: 12, value: '$145,000', created_at: '2025-01-15T10:30:00' },
        { id: '2', name: 'Customer Onboarding', stages: 4, deals: 8, value: '$78,500', created_at: '2025-02-03T14:45:00' },
        { id: '3', name: 'Partner Program', stages: 3, deals: 5, value: '$52,000', created_at: '2025-02-28T09:15:00' },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

    const handleEdit = (pipeline) => {
        setSelectedPipeline(pipeline);
        setIsAddEditDialogOpen(true);
    }

    const handleAdd = () => {
        setSelectedPipeline(null);
        setIsAddEditDialogOpen(true);
    }
    
    const handleSavePipeline = (formData) => {
        console.log("Saving pipeline:", formData, selectedPipeline?.id);
        setIsAddEditDialogOpen(false);
    }

    const handleDelete = (pipelineId) => {
        console.log("Deleting pipeline:", pipelineId);
    }


    return (
         <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Pipelines</h1>
                    <div className="ml-auto flex items-center gap-2">
                         {/* Add Filter/Export buttons if needed */}
                         <DialogTrigger asChild>
                            <Button size="sm" className="h-7 gap-1">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Create Pipeline
                                </span>
                            </Button>
                         </DialogTrigger>
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Your Pipelines</CardTitle>
                        <CardDescription>
                            Manage your sales pipelines and their stages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stages</TableHead>
                                    <TableHead className="hidden md:table-cell">Deals</TableHead>
                                    <TableHead className="hidden md:table-cell">Value</TableHead>
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
                                {!isLoading && !error && pipelines.map((pipeline) => (
                                    <TableRow key={pipeline.id}>
                                        <TableCell className="font-medium">{pipeline.name}</TableCell>
                                        <TableCell>{pipeline.stages}</TableCell>
                                        <TableCell className="hidden md:table-cell">{pipeline.deals}</TableCell>
                                        <TableCell className="hidden md:table-cell">{pipeline.value}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {format(new Date(pipeline.created_at), 'PP')}
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
                                                    {/* Link to a detailed pipeline view page */}
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/pipelines/${pipeline.id}`}>View/Manage Stages</Link>
                                                    </DropdownMenuItem>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem onClick={() => handleEdit(pipeline)}>Edit</DropdownMenuItem>
                                                    </DialogTrigger>
                                                    <DropdownMenuItem onClick={() => handleDelete(pipeline.id)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && !error && pipelines.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="text-center">No pipelines found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-{pipelines.length}</strong> of <strong>{pipelines.length}</strong> pipelines
                        </div>
                         {/* Optional Pagination */}
                    </CardFooter>
                </Card>
                
                {/* Basic Stage Visualization Placeholder - Needs significant work for Kanban */}
                 <div className="mt-8">
                     <h2 className="text-xl font-semibold mb-4">Pipeline Overview (Simple)</h2>
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                         {pipelines.map(p => (
                             <Card key={p.id}>
                                 <CardHeader>
                                     <CardTitle>{p.name}</CardTitle>
                                     <CardDescription>{p.deals} deals · {p.value}</CardDescription>
                                 </CardHeader>
                                 <CardContent>
                                     <p className="text-sm font-medium mb-2">Stages ({p.stages})</p>
                                     <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        {/* Replace with actual stage names */}
                                         {Array.from({ length: p.stages }).map((_, i) => <li key={i}>Stage {i+1} Name</li>)}
                                     </ul>
                                     <Button variant="secondary" size="sm" className="mt-4" asChild>
                                        <Link href={`/pipelines/${p.id}`}>Manage Stages & Deals</Link>
                                     </Button>
                                 </CardContent>
                             </Card>
                         ))}
                     </div>
                 </div>

            </main>

             {/* Add/Edit Dialog Content */}
             <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                     <DialogTitle>{selectedPipeline ? 'Edit Pipeline' : 'Create New Pipeline'}</DialogTitle>
                     <DialogDescription>
                         {selectedPipeline ? 'Make changes to the pipeline name.' : 'Enter the name for the new pipeline.'}
                     </DialogDescription>
                 </DialogHeader>
                  <PipelineForm 
                    pipeline={selectedPipeline} 
                    onSave={handleSavePipeline} 
                    onCancel={() => setIsAddEditDialogOpen(false)} 
                  />
                 <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                     {/* Add Save button (likely inside PipelineForm) */}
                 </DialogFooter>
             </DialogContent>
         </Dialog>
    );
};

export default PipelinesPage;
