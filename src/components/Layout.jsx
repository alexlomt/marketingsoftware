// src/components/Layout.jsx
'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'; // Import named export
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { Button } from '@/components/ui/button'; // Import shadcn Button
import { Menu, Search, Bell, User } from 'lucide-react'; // Import icons from lucide-react
import { Input } from '@/components/ui/input'; // Assuming Input component will be added

// You might need to add Input and DropdownMenu components via shadcn CLI
// npx shadcn@latest add input dropdown-menu

const Layout = ({ children }) => {
  // Note: Sheet manages its own open/close state internally, 
  // so explicit state here might not be needed unless controlled externally.

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] dark:bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block dark:bg-gray-900/40">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (using Sheet) & Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 dark:bg-gray-900/40">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 dark:bg-gray-950">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Header Content (Search, Notifications, User) */}
          <div className="w-full flex-1">
            {/* Optional Search Form */}
            {/* <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 dark:bg-gray-800"
                />
              </div>
            </form> */}
          </div>

          {/* User Dropdown Area (Placeholder) */} 
          <Button variant="secondary" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
           {/* Replace above Button with DropdownMenu for actual functionality */}
           {/* Example:
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="secondary" size="icon" className="rounded-full">
                 <User className="h-5 w-5" />
                 <span className="sr-only">Toggle user menu</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuLabel>My Account</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem>Settings</DropdownMenuItem>
               <DropdownMenuItem>Support</DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem>Logout</DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
           */}
        </header>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
