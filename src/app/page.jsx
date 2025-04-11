'use client';

import { useEffect, useOptimistic, useState, useTransition } from 'react';
import Link from 'next/link'; // Added Link import based on build script version

// Simple counter functions using localStorage (from original page.tsx)
async function getStats() {
  // Simulate fetching stats, could be replaced with API call later if needed
  const count = localStorage.getItem('count') ? parseInt(localStorage.getItem('count') || '0') : 0;
  const recentAccess = JSON.parse(localStorage.getItem('recentAccess') || '[]');
  return { count, recentAccess };
}

async function incrementAndLog() {
  const count = localStorage.getItem('count') ? parseInt(localStorage.getItem('count') || '0') : 0;
  const newCount = count + 1;
  localStorage.setItem('count', newCount.toString());

  let recentAccess = JSON.parse(localStorage.getItem('recentAccess') || '[]');
  recentAccess.unshift({ accessed_at: new Date().toISOString() });
  if (recentAccess.length > 5) recentAccess = recentAccess.slice(0, 5); // Use slice instead of pop
  localStorage.setItem('recentAccess', JSON.stringify(recentAccess));

  return { count: newCount, recentAccess };
}


export default function Home() {
  const [stats, setStats] = useState({
    count: 0,
    recentAccess: []
  });
  const [optimisticStats, setOptimisticStats] = useOptimistic(stats);
  const [_, startTransition] = useTransition();

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  // Merged handleClick logic from page.tsx with incrementAndLog
  const handleClick = async () => {
    startTransition(async () => {
      setOptimisticStats(prevStats => ({
        count: prevStats.count + 1,
        recentAccess: [{ accessed_at: new Date().toISOString() }, ...prevStats.recentAccess.slice(0, 4)]
      }));
      const newStats = await incrementAndLog();
      setStats(newStats);
    });
  };

  // Using layout structure from build script's version, but adapted for localStorage stats
  return (
     <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Marketing Software CRM</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Stats (Local)</h2>
             <p className="mb-2">Button Clicks: {optimisticStats.count}</p>
            <p className="mb-4">Recent Clicks: {optimisticStats.recentAccess.length}</p>
             <div className="flex justify-center mb-4">
               <button
                 onClick={handleClick}
                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
               >
                 <span className="mr-2">+</span>
                 Increment Clicks
               </button>
             </div>
             <div className="h-[100px] overflow-auto text-center">
               {optimisticStats.recentAccess.map((log, i) => (
                 <div key={i} className="text-xs text-gray-400">
                   {new Date(log.accessed_at).toLocaleString()}
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2">
               <li>
                 <Link href="/dashboard" className="text-blue-500 hover:text-blue-400">
                   Go to Dashboard →
                 </Link>
               </li>
              <li>
                <Link href="/contacts" className="text-blue-500 hover:text-blue-400">
                  Manage Contacts
                </Link>
              </li>
               <li>
                <Link href="/pipelines" className="text-blue-500 hover:text-blue-400">
                  Sales Pipelines
                </Link>
              </li>
              <li>
                <Link href="/email-campaigns" className="text-blue-500 hover:text-blue-400">
                  Marketing Campaigns
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="text-blue-500 hover:text-blue-400">
                  Schedule Appointments
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
