// src/components/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils"; // Import cn utility
import { Button, buttonVariants } from "@/components/ui/button"; // Import shadcn Button
import { 
  Home, 
  Users, 
  Filter, 
  DollarSign, 
  Mail, 
  FileText, 
  Calendar, 
  Settings, 
  BarChart 
} from 'lucide-react'; // Import specific icons

// Simple icon mapping using lucide-react icons
const iconMap = {
  HomeIcon: Home,
  UserGroupIcon: Users,
  FunnelIcon: Filter,
  CurrencyDollarIcon: DollarSign,
  EnvelopeIcon: Mail,
  DocumentTextIcon: FileText,
  CalendarIcon: Calendar,
  CogIcon: Settings,
  ChartBarIcon: BarChart,
};

export function Sidebar() { // Changed to named export
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
    { name: 'Contacts', href: '/contacts', icon: 'UserGroupIcon' },
    { name: 'Pipelines', href: '/pipelines', icon: 'FunnelIcon' },
    { name: 'Deals', href: '/deals', icon: 'CurrencyDollarIcon' },
    { name: 'Email Campaigns', href: '/email-campaigns', icon: 'EnvelopeIcon' },
    { name: 'Forms', href: '/forms', icon: 'DocumentTextIcon' },
    { name: 'Appointments', href: '/appointments', icon: 'CalendarIcon' },
    { name: 'Workflows', href: '/workflows', icon: 'CogIcon' },
   // { name: 'Analytics', href: '/analytics', icon: 'ChartBarIcon' }, // Example: Comment out if not ready
  ];

  const isActive = (path) => {
    // Handle exact match for dashboard, startsWith for others
    if (path === '/dashboard') {
        return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 dark:bg-gray-950">
      {/* Header/Logo Area */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          {/* Optional: Replace with SVG Logo component */}
          <span className="h-6 w-6 bg-primary rounded-sm" /> 
          <span>Marketing CRM</span>
        </Link>
        {/* Optional: Add notification bell for desktop sidebar if needed */}
        {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button> */}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon]; // Get the icon component
            const active = isActive(item.href);
            return (
              Icon && (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }), // Use buttonVariants
                    "justify-start gap-3 rounded-lg px-3 py-2 transition-all", // Common styling
                    active 
                      ? "text-primary dark:text-white" 
                      : "text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  {/* Optional: Add badges here if needed */}
                  {/* {item.badge && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  )} */}
                </Link>
              )
            );
          })}
        </nav>
      </div>

      {/* Optional: Footer section - e.g., settings, help, user */}
      {/* <div className="mt-auto p-4 border-t">
         Example Settings Link 
        <Button variant="ghost" size="sm" className="justify-start w-full gap-3">
           <Settings className="h-4 w-4"/> Settings 
         </Button> 
      </div> */}
    </div>
  );
}
