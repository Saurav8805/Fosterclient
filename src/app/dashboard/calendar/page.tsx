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
  target_audience?: 'ALL' | 'Teachers' | 'Students'
  notify_type?: 'instant' | 'scheduled' | 'triggered'
  scheduled_at?: string
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
    type: 'Event',
    target_audience: 'ALL' as 'ALL' | 'Teachers' | 'Students',
    notify_type: 'instant' as 'instant' | 'scheduled' | 'triggered',
    scheduled_at: ''
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
      const result = await eventsApi.list(userRole || undefined)
      
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
      date: new Date().toISOString().split('T')[0],
      type: 'Event',
      target_audience: 'ALL',
      notify_type: 'instant',
      scheduled_at: ''
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
      type: event.type,
      target_audience: event.target_audience || 'ALL',
      notify_type: event.notify_type || 'instant',
      scheduled_at: event.scheduled_at || ''
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const senderName = localStorage.getItem('userName') || localStorage.getItem('userMobile') || 'School Admin'
    
    let formattedScheduledAt = eventForm.scheduled_at;
    if (eventForm.notify_type === 'scheduled' && eventForm.scheduled_at) {
      try {
        formattedScheduledAt = new Date(eventForm.scheduled_at).toISOString();
      } catch {
        formattedScheduledAt = eventForm.scheduled_at;
      }
    }

    const payload = {
      ...eventForm,
      scheduled_at: formattedScheduledAt,
      senderName,
      senderRole: userRole
    }

    try {
      let result
      if (editingEvent) {
        result = await eventsApi.update(editingEvent.id, payload)
      } else {
        result = await eventsApi.create(payload)
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: editingEvent ? 'Event updated successfully!' : 'Event created & target audience notified!' 
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

  const isStudent = userRole === 19

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Events</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage school events, set audience notifications (Teachers, Students, or ALL), and schedule alerts.</p>
        </div>
        {!isStudent && (
          <button 
            onClick={handleAddEvent}
            className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a2d7e] transition text-sm font-semibold shadow-sm flex items-center gap-2"
          >
            <span>📅</span> Add Event
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Upcoming Events & Scheduled Alerts</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-2"></div>
              <p className="text-xs text-gray-500">Loading events calendar...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-purple-50/20 transition gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                      <span className="px-2.5 py-0.5 bg-purple-100 text-[#5e3a9e] text-xs font-bold rounded-full">
                        {event.type}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600">{event.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                      <span className="font-semibold text-gray-700">📅 {formatDate(event.date)}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        👥 Audience: {event.target_audience || 'ALL'}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        🔔 {event.notify_type === 'scheduled' ? `Scheduled Alert (${event.scheduled_at ? new Date(event.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'Set'})` : event.notify_type === 'triggered' ? '✅ Notification Delivered' : 'Instant Alert'}
                      </span>
                    </div>
                  </div>

                  {!isStudent && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base font-medium">No events scheduled yet.</p>
              {!isStudent && (
                <button 
                  onClick={handleAddEvent}
                  className="mt-3 text-[#5e3a9e] hover:underline font-bold text-sm"
                >
                  + Add your first event
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b bg-[#5e3a9e] text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <p className="text-xs text-purple-200">Configure event details and audience notification triggers</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                  placeholder="e.g. Annual Sports Day / Unit Test"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Audience <span className="text-rose-500">*</span></label>
                <select
                  value={eventForm.target_audience}
                  onChange={(e) => setEventForm({...eventForm, target_audience: e.target.value as any})}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none bg-white font-semibold text-[#5e3a9e]"
                >
                  <option value="ALL">Everyone (Staff, Teachers & Students)</option>
                  <option value="Teachers">Teachers Only</option>
                  <option value="Students">Students & Parents Only</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Only the selected audience panel will receive instant/scheduled notifications.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    required
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Category</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none bg-white"
                  >
                    <option value="Event">Event</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Activity">Activity</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Alert Type</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="notify_type"
                      value="instant"
                      checked={eventForm.notify_type === 'instant'}
                      onChange={() => setEventForm({...eventForm, notify_type: 'instant'})}
                      className="accent-[#5e3a9e]"
                    />
                    <span>⚡ Instant Notification</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="notify_type"
                      value="scheduled"
                      checked={eventForm.notify_type === 'scheduled'}
                      onChange={() => setEventForm({...eventForm, notify_type: 'scheduled'})}
                      className="accent-[#5e3a9e]"
                    />
                    <span>⏰ Scheduled Alert</span>
                  </label>
                </div>
              </div>

              {eventForm.notify_type === 'scheduled' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventForm.scheduled_at}
                    onChange={(e) => setEventForm({...eventForm, scheduled_at: e.target.value})}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                  placeholder="Details about time, venue, or instructions..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#5e3a9e] text-white rounded-xl hover:bg-[#4a2d7e] transition disabled:opacity-50 text-sm font-semibold shadow-sm"
                >
                  {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
