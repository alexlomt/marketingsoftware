'use client'

import { useEffect, useOptimistic, useState, useTransition } from 'react'

// Simple counter functions to replace the ones that use Cloudflare
async function getStats() {
  return { count: 0, recentAccess: [] };
}

async function incrementAndLog() {
  const count = localStorage.getItem('count') ? parseInt(localStorage.getItem('count') || '0') : 0;
  const newCount = count + 1;
  localStorage.setItem('count', newCount.toString());
  
  const recentAccess = JSON.parse(localStorage.getItem('recentAccess') || '[]');
  recentAccess.unshift({ accessed_at: new Date().toISOString() });
  if (recentAccess.length > 5) recentAccess.pop();
  localStorage.setItem('recentAccess', JSON.stringify(recentAccess));
  
  return { count: newCount, recentAccess };
}

export default function Home() {
  const [stats, setStats] = useState<{ count: number; recentAccess: { accessed_at: string }[] }>({
    count: 0,
    recentAccess: []
  })
  const [optimisticStats, setOptimisticStats] = useOptimistic(stats)
  const [_, startTransition] = useTransition()

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  const handleClick = async () => {
    startTransition(async () => {
      setOptimisticStats({
        count: optimisticStats.count + 1,
        recentAccess: [{ accessed_at: new Date().toISOString() }, ...optimisticStats.recentAccess.slice(0, 4)]
      })
      const newStats = await incrementAndLog()
      setStats(newStats)
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8 sm:p-24">
      <div className="p-6 sm:p-8 w-full max-w-sm border rounded-lg shadow-sm">
        <p className="text-2xl font-medium text-center mb-4">Welcome to GoHighLevel Clone</p>
        <p className="text-center mb-4">This application is being prepared for deployment to Render.com</p>
        <div className="flex justify-center mb-4">
          <button 
            onClick={handleClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <span className="mr-2">+</span>
            Increment
          </button>
        </div>
        <div className="h-[100px] overflow-auto">
          {optimisticStats.recentAccess.map((log, i) => (
            <div key={i} className="text-sm text-gray-500 text-center">
              {new Date(log.accessed_at).toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
