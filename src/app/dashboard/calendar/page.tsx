'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CalendarPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19

  const events = [
    { id: 1, title: 'Annual Day', date: '2024-12-25', type: 'Event' },
    { id: 2, title: 'Parent-Teacher Meeting', date: '2024-12-15', type: 'Meeting' },
    { id: 3, title: 'Sports Day', date: '2024-12-20', type: 'Event' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Events</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            {!isStudent && (
              <button className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm">
                + Add Event
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-[#5e3a9e] text-xs rounded-full">{event.type}</span>
                    {!isStudent && (
                      <button className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
