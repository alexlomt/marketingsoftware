'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({
    count: 0,
    recentAccess: []
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Marketing Software CRM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
            <p className="mb-2">Total Clients: {stats.count}</p>
            <p className="mb-4">Recent Activity: {stats.recentAccess.length} logins</p>
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-400">
              Go to Dashboard →
            </Link>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/clients" className="text-blue-500 hover:text-blue-400">
                  Manage Clients
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-blue-500 hover:text-blue-400">
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
  )
}
