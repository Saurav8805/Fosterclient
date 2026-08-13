'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { galleryApi } from '@/lib/api'

interface GalleryItem {
  id: string
  title: string
  image_url: string
  category?: string
  description?: string
  event_date?: string
  created_at?: string
}

export default function GalleryPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)   // ← false by default, non-blocking
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDriveUrl, setFormDriveUrl] = useState('')
  const [formCategory, setFormCategory] = useState('Events')
  const [formEventDate, setFormEventDate] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const categories = ['All', 'Events', 'Sports', 'Activities', 'Celebrations', 'Excursions', 'General']

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/login')
      return
    }
    setUserRole(Number(role))
    fetchGallery()
  }, [])

  const parseGalleryItem = (item: any): GalleryItem => {
    let rawDescription = item.description || ''
    let eventDate = item.event_date || ''
    let cleanDescription = rawDescription

    // Extract embedded date format [Date: YYYY-MM-DD] if present
    const dateMatch = rawDescription.match(/\[Date:\s*([^\]]+)\]/)
    if (dateMatch) {
      if (!eventDate) {
        eventDate = dateMatch[1].trim()
      }
      cleanDescription = rawDescription.replace(/\[Date:\s*([^\]]+)\]/, '').trim()
    }

    // Fallback date to created_at if event_date is missing
    if (!eventDate && item.created_at) {
      eventDate = item.created_at.split('T')[0]
    }

    return {
      id: String(item.id),
      title: item.title || 'Untitled Event',
      image_url: item.image_url || item.drive_url || item.url || '',
      category: item.category || 'Events',
      description: cleanDescription,
      event_date: eventDate,
      created_at: item.created_at
    }
  }

  const fetchGallery = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const res = await galleryApi.list()
      
      let rawArray: any[] = []
      if (res.success && Array.isArray(res.data)) {
        rawArray = res.data
      } else if (Array.isArray(res)) {
        rawArray = res
      } else if (res.data && Array.isArray((res.data as any).gallery)) {
        rawArray = (res.data as any).gallery
      } else if (!res.success) {
        setFetchError(res.error || 'Failed to load gallery')
      }

      const parsedList = rawArray.map(parseGalleryItem)
      setGalleryList(parsedList)
    } catch (err: any) {
      console.error('Failed to fetch gallery:', err)
      setFetchError('Failed to load gallery albums. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const isStudent = userRole === 19

  const openAddModal = () => {
    setEditingItem(null)
    setFormTitle('')
    setFormDriveUrl('')
    setFormCategory('Events')
    setFormEventDate(new Date().toISOString().split('T')[0])
    setFormDescription('')
    setIsModalOpen(true)
  }

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item)
    setFormTitle(item.title)
    setFormDriveUrl(item.image_url || '')
    setFormCategory(item.category || 'Events')
    setFormEventDate(item.event_date ? item.event_date.split('T')[0] : '')
    setFormDescription(item.description || '')
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDriveUrl.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both the Title and Google Drive Link' })
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)

      const payload = {
        title: formTitle.trim(),
        driveUrl: formDriveUrl.trim(),
        imageUrl: formDriveUrl.trim(),
        category: formCategory,
        eventDate: formEventDate || null,
        description: formDescription.trim() || null
      }

      let res
      if (editingItem) {
        res = await galleryApi.update(editingItem.id, payload)
      } else {
        res = await galleryApi.add(payload)
      }

      if (res.success) {
        setMessage({
          type: 'success',
          text: editingItem ? 'Gallery album updated successfully!' : 'Google Drive album added successfully!'
        })
        setIsModalOpen(false)

        if (res.data) {
          const parsed = parseGalleryItem(res.data)
          setGalleryList(prev => {
            const index = prev.findIndex(item => String(item.id) === String(parsed.id))
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = parsed
              return updated
            } else {
              return [parsed, ...prev]
            }
          })
        }

        await fetchGallery()
        setTimeout(() => setMessage(null), 4000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Operation failed' })
      }
    } catch (err: any) {
      console.error('Gallery submit error:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to save gallery item' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      setMessage(null)
      const res = await galleryApi.delete(id)
      if (res.success) {
        setMessage({ type: 'success', text: `Deleted "${title}" successfully` })
        setGalleryList(prev => prev.filter(item => item.id !== id))
        setTimeout(() => setMessage(null), 4000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to delete' })
      }
    } catch (err: any) {
      console.error('Delete gallery item error:', err)
      setMessage({ type: 'error', text: 'Failed to delete item' })
    }
  }

  const filteredGallery = galleryList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>🖼️</span> School Event Gallery
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Access Google Drive photo & video albums for school events and activities
            </p>
          </div>
          {!isStudent && (
            <button
              onClick={openAddModal}
              className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a2d7e] transition flex items-center justify-center gap-2 font-medium shadow-md shadow-purple-100 text-sm active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Google Drive URL
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Banner Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-sm transition ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
              <span className="text-sm font-medium">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <svg
                className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search event title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] transition"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-[#5e3a9e] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subtle loading bar at top when fetching */}
        {loading && (
          <div className="w-full h-1 bg-purple-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[#5e3a9e] rounded-full animate-pulse w-3/4"></div>
          </div>
        )}

        {/* Fetch error */}
        {fetchError && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <span>⚠️ {fetchError}</span>
            <button onClick={fetchGallery} className="text-xs font-bold underline ml-3">Retry</button>
          </div>
        )}

        {/* Gallery Cards Grid */}
        {filteredGallery.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
            <div className="w-16 h-16 bg-purple-50 text-[#5e3a9e] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📂
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {loading ? 'Loading Gallery...' : 'No Event Albums Found'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {loading
                ? 'Fetching gallery albums, please wait...'
                : searchQuery || selectedCategory !== 'All'
                ? 'No albums match your search query or filter. Try clearing filters.'
                : 'No Google Drive gallery links have been uploaded yet.'}
            </p>
            {!loading && !isStudent && !searchQuery && selectedCategory === 'All' && (
              <button
                onClick={openAddModal}
                className="bg-[#5e3a9e] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4a2d7e] transition"
              >
                + Add First Drive Album
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Top Card Header */}
                  <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-purple-50/50 to-white">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-[#5e3a9e] rounded-full border border-purple-200/60">
                        {item.category || 'Events'}
                      </span>
                      {item.event_date && (
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          📅 {new Date(item.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#5e3a9e] transition line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="p-5">
                    {item.description ? (
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-4">
                        Google Drive folder containing event photos and videos.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-5 pt-0 mt-auto border-t border-gray-50 flex flex-col gap-2.5">
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm active:scale-98"
                  >
                    <span>📷</span>
                    <span>View Photos & Videos (Drive)</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {!isStudent && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-xs text-gray-600 hover:text-blue-600 px-2.5 py-1 rounded hover:bg-gray-100 transition flex items-center gap-1 font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-xs text-rose-500 hover:text-rose-700 px-2.5 py-1 rounded hover:bg-rose-50 transition flex items-center gap-1 font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <span>{editingItem ? '✏️ Edit Event Album' : '🔗 Add Google Drive Album'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter details and public Google Drive URL for students, staff & parents
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-full hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none"
                />
              </div>

              {/* Google Drive URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Drive / Album URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://drive.google.com/drive/folders/123xyz..."
                  value={formDriveUrl}
                  onChange={e => setFormDriveUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none font-mono text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  💡 Make sure the Google Drive link permission is set to "Anyone with the link can view".
                </p>
              </div>

              {/* Grid: Category & Event Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date of Event
                  </label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={e => setFormEventDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description / Event Details <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter details about the event, chief guest, class participants, etc."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingItem ? 'Update Album' : 'Save Google Drive Album'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
