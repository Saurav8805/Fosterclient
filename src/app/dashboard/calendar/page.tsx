'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { eventsApi } from '@/lib/api'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  type: string
  created_at?: string
}

export default function CalendarPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'Event'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { 
      router.push('/login')
      return 
    }
    setUserRole(Number(role))
  }, [])

  useEffect(() => {
    if (userRole !== null) {
      fetchEvents()
    }
  }, [userRole])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const result = await eventsApi.list()
      
      if (result.success && Array.isArray(result.data)) {
        setEvents(result.data)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setMessage({ type: 'error', text: 'Failed to load events' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      date: '',
      type: 'Event'
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      type: event.type
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      let result
      if (editingEvent) {
        result = await eventsApi.update(editingEvent.id, eventForm)
      } else {
        result = await eventsApi.create(eventForm)
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: editingEvent ? 'Event updated successfully!' : 'Event created successfully!' 
        })
        setShowModal(false)
        await fetchEvents()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save event' })
      }
    } catch (error) {
      console.error('Failed to save event:', error)
      setMessage({ type: 'error', text: 'Failed to save event. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const result = await eventsApi.delete(eventId)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Event deleted successfully!' })
        await fetchEvents()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete event' })
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      setMessage({ type: 'error', text: 'Failed to delete event' })
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar & Events</h1>
        {!isStudent && (
          <button 
            onClick={handleAddEvent}
            className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm font-medium"
          >
            + Add Event
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 flex justify-between items-start hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-[#5e3a9e] text-xs rounded-full font-medium">
                      {event.type}
                    </span>
                    {!isStudent && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No events scheduled yet.</p>
              {!isStudent && (
                <button 
                  onClick={handleAddEvent}
                  className="mt-4 text-[#5e3a9e] hover:text-[#4a2d7e] font-medium"
                >
                  Add your first event
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                  placeholder="Annual Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                  placeholder="Event details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                >
                  <option value="Event">Event</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Activity">Activity</option>
                  <option value="Exam">Exam</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#5e3a9e] text-white rounded-lg hover:bg-[#4a2d7e] transition disabled:opacity-50 font-medium"
                >
                  {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
