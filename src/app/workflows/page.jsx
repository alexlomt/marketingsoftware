'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    MoreVertical, File, PlusCircle, ListFilter, Eye, Share2, Edit, Trash2, Play, Pause, Loader2, Zap, Mail, UserCheck, Tag, Settings, Bell, Clock // Example Icons for actions/triggers
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch"; // For activating/deactivating
import { Label } from "@/components/ui/label";
import { AlertTriangle } from 'lucide-react'; // Added for error display

// Assume API functions exist
// import { fetchWorkflows, updateWorkflowStatus, deleteWorkflow } from '@/lib/api/workflows';

// --- Helper Data & Functions ---

// Simple icon mapping for triggers (expand as needed)
const triggerIcons = {
    'New Contact Created': UserCheck,
    'Deal Stage Changed': DollarSign,
    'Form Submitted': File, // Using File icon as example
    'Tag Added': Tag,
    'Deal Closed Won': DollarSign, // Example, might need specific icon
    'default': Zap // Fallback icon
};

// Simple icon mapping for common actions (expand as needed)
const actionIcons = {
     'Send Email': Mail,
     'Add Tag': Tag,
     'Update Field': Edit,
     'Create Task': ListFilter, // Example
     'Send Notification': Bell, // Assuming Bell from lucide-react
     'Wait': Clock, // Assuming Clock from lucide-react
     'default': Settings // Fallback icon
};


// --- Main Page Component ---

const WorkflowsPage = () => {
    const router = useRouter();
    // TODO: Replace with actual API data fetching
    const [workflows, setWorkflows] = useState([
        { id: '1', name: 'New Lead Follow-up', description: 'Automatically follow up', trigger: 'New Contact Created', actions: ['Send Email', 'Add Tag', 'Create Task'], is_active: true, created_at: '2025-02-15T10:30:00' },
        { id: '2', name: 'Deal Stage Update', description: 'Notify team on changes', trigger: 'Deal Stage Changed', actions: ['Send Notification', 'Update Field'], is_active: true, created_at: '2025-02-28T14:45:00' },
        { id: '3', name: 'Customer Onboarding', description: 'Start onboarding process', trigger: 'Deal Closed Won', actions: ['Send Email', 'Create Task', 'Add Tag', 'Wait', 'Send Email'], is_active: false, created_at: '2025-03-10T09:15:00' },
    ]);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const [updatingStatusId, setUpdatingStatusId] = useState(null); // Track which switch is loading
    
    // --- Data Fetching ---
    const loadWorkflows = useCallback(async () => {
         setIsLoading(true);
         setError(null);
         try {
             // TODO: Replace with actual API call
             console.log("Fetching workflows...");
             // const response = await fetch('/api/workflows');
             // if (!response.ok) throw new Error('Failed to fetch');
             // const data = await response.json();
             // setWorkflows(data.workflows || []);
             await new Promise(res => setTimeout(res, 500)); // Simulate delay
             console.log("Workflows loaded (mocked)");
         } catch (err) {
             console.error("Failed to load workflows:", err);
             setError(err.message);
             setWorkflows([]);
         } finally {
             setIsLoading(false);
         }
     }, []);

     useEffect(() => {
         loadWorkflows();
     }, [loadWorkflows]);

    // --- Actions ---

    // Redirect to workflow builder
    const goToWorkflowBuilder = (workflowId = null) => {
        const path = workflowId ? `/workflows/builder/${workflowId}` : '/workflows/builder/new';
        console.log(`Redirecting to workflow builder: ${path}`);
        router.push(path); // Use Next.js router
    }

    const toggleWorkflowStatus = async (workflowId, currentStatus) => {
        const newStatus = !currentStatus;
        setUpdatingStatusId(workflowId); // Indicate loading for this specific switch
        
        // Optimistic update
        setWorkflows(currentWorkflows => 
            currentWorkflows.map(wf => wf.id === workflowId ? { ...wf, is_active: newStatus } : wf)
        );

        try {
            // TODO: Replace with actual API call
            console.log(`Updating status for ${workflowId} to ${newStatus ? 'Active' : 'Inactive'}...`);
            // const response = await fetch(`/api/workflows/${workflowId}/status`, { 
            //    method: 'PUT', 
            //    headers: { 'Content-Type': 'application/json' },
            //    body: JSON.stringify({ is_active: newStatus })
            // });
            // if (!response.ok) throw new Error('Failed to update status');
            await new Promise(res => setTimeout(res, 700)); // Simulate API call
            console.log("Status updated successfully (simulated)");
            // Optional: Show success toast/message

        } catch (err) {
            console.error("Error updating workflow status:", err);
            alert(`Failed to update status: ${err.message}`);
            // Revert optimistic update on error
            setWorkflows(currentWorkflows => 
                currentWorkflows.map(wf => wf.id === workflowId ? { ...wf, is_active: currentStatus } : wf)
            );
        } finally {
             setUpdatingStatusId(null); // Clear loading indicator for this switch
        }
    }

    const handleDelete = async (workflowId) => {
         if (!confirm('Are you sure you want to delete this workflow?')) return;
         console.log("Deleting workflow:", workflowId);
         setError(null); // Clear previous errors
         // TODO: Add loading state for deletion?
         try {
             // TODO: Replace with actual API call
            // const response = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
            // if (!response.ok) throw new Error('Failed to delete');
             await new Promise(res => setTimeout(res, 500));
             console.log("Workflow deleted (simulated)");
             setWorkflows(currentWorkflows => currentWorkflows.filter(wf => wf.id !== workflowId));
         } catch(err) {
             console.error("Error deleting workflow:", err);
             setError(`Failed to delete workflow: ${err.message}`); // Show error feedback
             alert(`Failed to delete workflow: ${err.message}`);
         }
    }

    return (
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Workflows</h1>
                    <div className="ml-auto flex items-center gap-2">
                         {/* Add Filters if needed */}
                         <Button size="sm" className="h-8 gap-1" onClick={() => goToWorkflowBuilder()}> 
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Create Workflow
                            </span>
                        </Button>
                    </div>
                </div>
                
                 {/* Display Page Errors */} 
                 {error && (
                    <Card className="border-destructive bg-destructive/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-destructive">Error</CardTitle>
                             <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-destructive">{error}</p>
                             <Button variant="ghost" size="sm" onClick={loadWorkflows} className="mt-2 text-destructive hover:text-destructive">Retry</Button>
                        </CardContent>
                    </Card>
                 )}

                <Card>
                    <CardHeader>
                        <CardTitle>Your Workflows</CardTitle>
                        <CardDescription>
                            Automate tasks based on triggers and conditions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Trigger</TableHead>
                                    <TableHead className="hidden sm:table-cell">Actions</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {isLoading && (
                                   <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading workflows...
                                    </TableCell></TableRow>
                               )}
                                {!isLoading && error && ( 
                                    <TableRow><TableCell colSpan={5} className="text-center text-destructive py-10">Failed to load workflows: {error}</TableCell></TableRow>
                                )}
                                {!isLoading && !error && workflows.map((workflow) => { 
                                    const TriggerIcon = triggerIcons[workflow.trigger] || triggerIcons['default'];
                                    const isSwitchLoading = updatingStatusId === workflow.id;
                                    return (
                                        <TableRow key={workflow.id}>
                                            <TableCell className="font-medium">
                                                {workflow.name}
                                                <div className="text-xs text-muted-foreground hidden md:block">{workflow.description}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <TriggerIcon className="h-4 w-4 text-muted-foreground"/>
                                                    <span>{workflow.trigger}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                 <div className="flex items-center gap-1">
                                                     <span className="text-sm">{workflow.actions?.length || 0}</span>
                                                      <span className="text-xs text-muted-foreground">step(s)</span>
                                                     {/* Optionally show icons for first few actions */}
                                                     <div className="flex -space-x-1 overflow-hidden ml-2">
                                                        {workflow.actions?.slice(0, 3).map((actionName, idx) => {
                                                             const ActionIcon = actionIcons[actionName] || actionIcons['default'];
                                                             return <ActionIcon key={idx} className="inline-block h-4 w-4 text-muted-foreground bg-background rounded-full ring-1 ring-border" title={actionName}/>;
                                                         })}
                                                     </div>
                                                 </div>
                                            </TableCell>
                                            <TableCell>
                                                 <div className="flex items-center space-x-2">
                                                     <Switch
                                                         id={`status-${workflow.id}`}
                                                         checked={workflow.is_active}
                                                         onCheckedChange={() => toggleWorkflowStatus(workflow.id, workflow.is_active)}
                                                         disabled={isSwitchLoading} // Disable while updating
                                                         aria-label={workflow.is_active ? 'Deactivate' : 'Activate'}
                                                     />
                                                     <Label htmlFor={`status-${workflow.id}`} className="text-xs w-12"> {/* Fixed width label */} 
                                                         {isSwitchLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : (workflow.is_active ? 'Active' : 'Inactive')}
                                                     </Label>
                                                 </div>
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
                                                        <DropdownMenuItem onClick={() => goToWorkflowBuilder(workflow.id)}>
                                                             <Edit className="mr-2 h-4 w-4"/> Edit Workflow
                                                        </DropdownMenuItem>
                                                         <DropdownMenuItem>View History</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                                                            onClick={() => handleDelete(workflow.id)}
                                                        >
                                                             <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {!isLoading && !error && workflows.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10">No workflows created yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{workflows.length}</strong> workflow(s)
                        </div>
                         {/* Optional Pagination */}
                    </CardFooter>
                </Card>
            </main>
            {/* No Dialog needed here if creation/edit goes to builder */}
        );
};

export default WorkflowsPage;
