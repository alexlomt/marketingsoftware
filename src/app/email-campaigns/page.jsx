'use client';

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import Link from 'next/link';
import { format } from 'date-fns'; // For date formatting
import {
    MoreVertical,
    File,
    PlusCircle,
    ListFilter,
    Calendar as CalendarIcon, // Alias for icon
    AreaChart, // Example for analytics
    MailCheck, // Example for analytics
    XCircle, // Example for analytics
    Users, // Example for analytics
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Added for filters
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"; // Added for date range
import { Calendar } from "@/components/ui/calendar"; // Added for date range
import { Progress } from "@/components/ui/progress"; // Added for analytics cards
import { cn } from "@/lib/utils"; // Added for date picker styling
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

// Placeholder for Add/Edit Campaign Form/Editor component
const CampaignForm = ({ campaign, onSave, onCancel }) => {
    return (
        <div className="grid gap-4 py-4">
            <p>Campaign form/editor placeholder for {campaign ? campaign.id : 'new campaign'}.</p>
            {/* Full editor integration needed here */}
        </div>
    )
}


const EmailCampaignsPage = () => {
    // TODO: Replace with actual API data fetching
    const [campaigns, setCampaigns] = useState([
        { id: '1', name: 'March Newsletter', subject: 'Your March Update is Here!', status: 'Sent', recipients: 1248, open_rate: '24.8%', click_rate: '12.3%', sent_date: '2025-03-15T10:00:00' },
        { id: '2', name: 'Product Launch', subject: 'Introducing Our New Product!', status: 'Scheduled', recipients: 1500, open_rate: '-', click_rate: '-', sent_date: '2025-04-01T09:00:00' },
        { id: '3', name: 'Feedback Survey', subject: 'We Value Your Opinion', status: 'Draft', recipients: 0, open_rate: '-', click_rate: '-', sent_date: null },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [dateRange, setDateRange] = React.useState(); // For Date Picker

    const handleEdit = (campaign) => {
        setSelectedCampaign(campaign);
        setIsAddEditDialogOpen(true);
    }

    const handleAdd = () => {
        setSelectedCampaign(null);
        setIsAddEditDialogOpen(true);
    }
    
    const handleSaveCampaign = (formData) => {
        console.log("Saving campaign:", formData, selectedCampaign?.id);
        setIsAddEditDialogOpen(false);
    }

    const handleDelete = (campaignId) => {
        console.log("Deleting campaign:", campaignId);
    }


    return (
         <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Email Campaigns</h1>
                    <div className="ml-auto flex items-center gap-2">
                         {/* Filters */}
                         <Input placeholder="Search campaigns..." className="h-7 hidden sm:block w-48" />
                         <Select>
                            <SelectTrigger className="h-7 w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                         {/* Date Range Picker */}
                         <Popover>
                             <PopoverTrigger asChild>
                                 <Button
                                     id="date"
                                     variant={"outline"}
                                     size="sm"
                                     className={cn(
                                         "h-7 w-[200px] justify-start text-left font-normal",
                                         !dateRange && "text-muted-foreground"
                                     )}
                                 >
                                     <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                     {dateRange?.from ? (
                                         dateRange.to ? (
                                             <>
                                                 {format(dateRange.from, "LLL dd, y")} -{" "}
                                                 {format(dateRange.to, "LLL dd, y")}
                                             </>
                                         ) : (
                                             format(dateRange.from, "LLL dd, y")
                                         )
                                     ) : (
                                         <span>Pick a date range</span>
                                     )}
                                 </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="end">
                                 <Calendar
                                     initialFocus
                                     mode="range"
                                     defaultMonth={dateRange?.from}
                                     selected={dateRange}
                                     onSelect={setDateRange}
                                     numberOfMonths={2}
                                 />
                             </PopoverContent>
                         </Popover>
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
                                    Create Campaign
                                </span>
                            </Button>
                         </DialogTrigger>
                    </div>
                </div>
                
                {/* Analytics Cards */}
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">34,582</div>
                            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                            <MailCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">28.3%</div>
                            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
                             <AreaChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.1%</div>
                            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unsubscribes</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">128</div>
                            <p className="text-xs text-muted-foreground">-10% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaigns Table */} 
                <Card>
                    <CardHeader>
                        <CardTitle>Campaigns</CardTitle>
                        <CardDescription>
                            Your recent email campaigns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Sent Date</TableHead>
                                    <TableHead className="hidden md:table-cell">Recipients</TableHead>
                                    <TableHead className="hidden sm:table-cell">Open Rate</TableHead>
                                    <TableHead className="hidden sm:table-cell">Click Rate</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {isLoading && (
                                   <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
                               )}
                               {error && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-red-600">Error: {error}</TableCell></TableRow>
                               )}
                                {!isLoading && !error && campaigns.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">
                                            <div className="font-medium">{campaign.name}</div>
                                            <div className="text-xs text-muted-foreground hidden md:block">{campaign.subject}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ 
                                                campaign.status === 'Sent' ? 'default' : 
                                                campaign.status === 'Scheduled' ? 'secondary' : 'outline'
                                            }>
                                                {campaign.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {campaign.sent_date ? format(new Date(campaign.sent_date), 'PPp') : '-'}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{campaign.recipients}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{campaign.open_rate}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{campaign.click_rate}</TableCell>
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
                                                    <DropdownMenuItem>View Stats</DropdownMenuItem>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem onClick={() => handleEdit(campaign)}>Edit</DropdownMenuItem>
                                                    </DialogTrigger>
                                                     <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-600" 
                                                        onClick={() => handleDelete(campaign.id)}
                                                     >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && !error && campaigns.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center">No campaigns found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-{campaigns.length}</strong> of <strong>{campaigns.length}</strong> campaigns
                        </div>
                         {/* Optional Pagination */}
                    </CardFooter>
                </Card>

            </main>

             {/* Add/Edit Dialog Content */}
             <DialogContent className="sm:max-w-3xl"> {/* Make dialog wider */}
                 <DialogHeader>
                     <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                     <DialogDescription>
                         {selectedCampaign ? 'Modify the campaign details and content.' : 'Set up a new email campaign.'}
                     </DialogDescription>
                 </DialogHeader>
                  <CampaignForm 
                    campaign={selectedCampaign} 
                    onSave={handleSaveCampaign} 
                    onCancel={() => setIsAddEditDialogOpen(false)} 
                  />
                 <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                     {/* Add Save/Send buttons (likely inside CampaignForm) */}
                 </DialogFooter>
             </DialogContent>
         </Dialog>
    );
};

export default EmailCampaignsPage;
