'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns'; // For date formatting
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, BarChartHorizontal, Mail } from 'lucide-react';

const DashboardPage = () => {
  // Sample data
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
  
  // Stats for the dashboard
  const stats = [
    { title: 'Total Contacts', value: '1,248', change: '+8.2%', icon: Users },
    { title: 'Open Deals', value: '42', change: '+12.5%', icon: DollarSign },
    { title: 'Revenue (MTD)', value: '$128,500', change: '+18.3%', icon: BarChartHorizontal },
    { title: 'Email Open Rate', value: '24.8%', change: '-2.5%', icon: Mail },
  ];
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Header Area */}
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            <div className="ml-auto flex items-center gap-2">
                <Button size="sm">
                    {/* Optional Icon: <PlusCircle className="h-4 w-4 mr-1" /> */}
                    New Deal
                </Button>
            </div>
        </div>

      {/* Stats Section using shadcn Card */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change && stat.change.startsWith('+');
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                   <p className={`text-xs ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} text-muted-foreground flex items-center`}>
                      {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1"/> : <ArrowDownRight className="h-4 w-4 mr-1"/>}
                      {stat.change} from last month
                    </p>
                 )} 
              </CardContent>
            </Card>
          );
        })}
      </div>
      
       {/* Table Sections using Shadcn Table */}
       <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
         {/* Recent Deals Table */}
         <Card className="xl:col-span-1">
           <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
               <CardTitle>Recent Deals</CardTitle>
               {/* <CardDescription> Optional Description </CardDescription> */}
             </div>
             <Button asChild size="sm" className="ml-auto gap-1">
               <Link href="/deals">View All</Link>
             </Button>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Deal</TableHead>
                   <TableHead>Stage</TableHead>
                   <TableHead className="text-right">Value</TableHead>
                   {/* <TableHead>Contact</TableHead> Optional */}
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {recentDeals.slice(0, 5).map((deal) => ( // Limit rows shown
                   <TableRow key={deal.id}>
                     <TableCell>
                       <div className="font-medium">{deal.title}</div>
                       <div className="text-sm text-muted-foreground md:inline">
                         {deal.contact} 
                       </div>
                     </TableCell>
                     <TableCell>{deal.stage}</TableCell>
                     <TableCell className="text-right">{deal.value}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>

        {/* Upcoming Appointments Table */}
         <Card className="xl:col-span-1">
           <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
               <CardTitle>Upcoming Appointments</CardTitle>
               {/* <CardDescription> Optional Description </CardDescription> */}
             </div>
             <Button asChild size="sm" className="ml-auto gap-1">
               <Link href="/appointments">View All</Link>
             </Button>
           </CardHeader>
           <CardContent>
              <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Contact</TableHead>
                   <TableHead>Title</TableHead>
                   <TableHead className="text-right">Date & Time</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {upcomingAppointments.slice(0, 5).map((appt) => ( // Limit rows shown
                   <TableRow key={appt.id}>
                      <TableCell>
                       <div className="font-medium">{appt.contact}</div>
                     </TableCell>
                     <TableCell>{appt.title}</TableCell>
                     <TableCell className="text-right">
                       {format(new Date(appt.date), 'PPpp')} {/* Format date */}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
       </div>
    </div>
  );
};

export default DashboardPage;
