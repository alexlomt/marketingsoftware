'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AppointmentsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="appointments-container flex min-h-screen">
      {/* Sidebar */}
      <div className={`appointments-sidebar bg-gray-900 w-64 p-4 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <h2 className="text-xl font-bold mb-4">Appointments</h2>
        <nav className="space-y-2">
          <Link href="/appointments" className="block py-2 px-4 rounded hover:bg-gray-800">
            Calendar
          </Link>
          <Link href="/appointments/upcoming" className="block py-2 px-4 rounded hover:bg-gray-800">
            Upcoming
          </Link>
          <Link href="/appointments/past" className="block py-2 px-4 rounded hover:bg-gray-800">
            Past
          </Link>
          <Link href="/appointments/settings" className="block py-2 px-4 rounded hover:bg-gray-800">
            Settings
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="appointments-content flex-1 p-6">
        <button 
          className="md:hidden mb-4 p-2 bg-gray-800 rounded"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? 'Close Menu' : 'Open Menu'}
        </button>
        {children}
      </div>
    </div>
  )
}
