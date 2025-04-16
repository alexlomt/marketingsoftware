'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    MoreVertical,
    File,
    PlusCircle,
    ListFilter,
    DollarSign,
    ClipboardList, // For activities
    CalendarClock, // For forecast
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
import { Progress } from "@/components/ui/progress"; // For probability
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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


// Placeholder for Add/Edit Deal Form component
const DealForm = ({ deal, onSave, onCancel }) => {
    return (
        <div className="grid gap-4 py-4">
            <p>Deal form placeholder for {deal ? deal.id : 'new deal'}.</p>
             <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="title" className="text-right">Title</Label>
                 <Input id="title" defaultValue={deal?.title} className="col-span-3" />
             </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="value" className="text-right">Value ($)</Label>
                 <Input id="value" type="number" defaultValue={deal?.value?.replace('$','').replace(',','')} className="col-span-3" />
             </div>
             {/* Add fields for pipeline, stage, contact, etc. */}
        </div>
    )
}


const DealsPage = () => {
    // TODO: Replace with actual API data fetching
    const [deals, setDeals] = useState([
        { id: '1', title: 'Enterprise Software License', value: '$15,000', pipeline: 'Sales Pipeline', stage: 'Negotiation', contact: 'Acme Corp', probability: 75, expected_close_date: '2025-04-15' },
        { id: '2', title: 'Consulting Services', value: '$8,500', pipeline: 'Sales Pipeline', stage: 'Proposal', contact: 'TechStart Inc', probability: 50, expected_close_date: '2025-04-30' },
        { id: '3', title: 'Annual Maintenance Contract', value: '$12,000', pipeline: 'Customer Onboarding', stage: 'Closed Won', contact: 'Global Systems', probability: 100, expected_close_date: '2025-03-20' },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

    const handleEdit = (deal) => {
        setSelectedDeal(deal);
        setIsAddEditDialogOpen(true);
    }

    const handleAdd = () => {
        setSelectedDeal(null);
        setIsAddEditDialogOpen(true);
    }
    
    const handleSaveDeal = (formData) => {
        console.log("Saving deal:", formData, selectedDeal?.id);
        setIsAddEditDialogOpen(false);
    }

    const handleDelete = (dealId) => {
        console.log("Deleting deal:", dealId);
    }


    return (
         <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Deals</h1>
                    <div className="ml-auto flex items-center gap-2">
                         {/* Filters */}
                         <Input placeholder="Search deals..." className="h-7 hidden sm:block w-48" />
                         <Select>
                            <SelectTrigger className="h-7 w-[160px]">
                                <SelectValue placeholder="Pipeline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Pipelines</SelectItem>
                                <SelectItem value="sales">Sales Pipeline</SelectItem>
                                <SelectItem value="onboarding">Customer Onboarding</SelectItem>
                                <SelectItem value="partner">Partner Program</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select>
                            <SelectTrigger className="h-7 w-[160px]">
                                <SelectValue placeholder="Stage" />
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectItem value="all">All Stages</SelectItem>
                                 <SelectItem value='qualification'>Qualification</SelectItem>
                                 <SelectItem value='proposal'>Proposal</SelectItem>
                                 <SelectItem value='negotiation'>Negotiation</SelectItem>
                                 <SelectItem value='closed_won'>Closed Won</SelectItem>
                                 <SelectItem value='closed_lost'>Closed Lost</SelectItem>
                            </SelectContent>
                        </Select>
                         {/* Action Buttons */}
                         <Button size="sm" variant="outline" className="h-7 gap-1">
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Export
                            </span>
                        </Button>
                         <DialogTrigger asChild>
                            <Button size="sm" className="h-7 gap-1" onClick={handleAdd}>
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Add Deal
                                </span>
                            </Button>
                         </DialogTrigger>
                    </div>
                </div>
                
                {/* Deals Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Pipeline</CardTitle>
                        <CardDescription>
                            Track your sales opportunities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deal Title</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead className="hidden md:table-cell">Probability</TableHead>
                                    <TableHead className="hidden sm:table-cell">Expected Close</TableHead>
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
                                {!isLoading && !error && deals.map((deal) => (
                                    <TableRow key={deal.id}>
                                        <TableCell>
                                             <div className="font-medium">{deal.title}</div>
                                             <div className="text-xs text-muted-foreground">{deal.contact} ({deal.pipeline})</div>
                                        </TableCell>
                                        <TableCell>
                                            {/* Could use a Badge here too */}
                                            {deal.stage} 
                                        </TableCell>
                                         <TableCell>{deal.value}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                             <Progress value={deal.probability} aria-label={`${deal.probability}% probability`} className="h-2" />
                                              <span className="text-xs text-muted-foreground ml-2">{deal.probability}%</span>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {format(new Date(deal.expected_close_date), 'PP')}
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
                                                     <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem onClick={() => handleEdit(deal)}>Edit</DropdownMenuItem>
                                                    </DialogTrigger>
                                                     <DropdownMenuItem>Change Stage</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-600" 
                                                        onClick={() => handleDelete(deal.id)}
                                                     >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && !error && deals.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="text-center">No deals found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-{deals.length}</strong> of <strong>{deals.length}</strong> deals
                        </div>
                         {/* Optional Pagination */}
                    </CardFooter>
                </Card>
                
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$250,345</div>
                            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                           <p>Deal stage updated: "Enterprise License"</p>
                           <p>Note added: "Consulting Services"</p>
                           <p>Deal created: "New Website Build"</p>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Forecast (Next 30d)</CardTitle>
                             <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,800</div>
                            <p className="text-xs text-muted-foreground">Based on weighted probability</p>
                        </CardContent>
                    </Card>
                </div>

            </main>

             {/* Add/Edit Dialog Content */}
             <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                     <DialogTitle>{selectedDeal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
                     <DialogDescription>
                         {selectedDeal ? 'Make changes to the deal details.' : 'Enter the details for the new deal.'}
                     </DialogDescription>
                 </DialogHeader>
                  <DealForm 
                    deal={selectedDeal} 
                    onSave={handleSaveDeal} 
                    onCancel={() => setIsAddEditDialogOpen(false)} 
                  />
                 <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                     {/* Add Save button (likely inside DealForm) */}
                 </DialogFooter>
             </DialogContent>
         </Dialog>
    );
};

export default DealsPage;
