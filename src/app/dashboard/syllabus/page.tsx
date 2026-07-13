'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { syllabusApi, configApi } from '@/lib/api'

interface SyllabusItem {
  id: string
  class: string
  subject: string
  topics: string
  description: string | null
  status: string
  created_at: string
}

const emptyForm = {
  studentClass: '',
  subject: '',
  topics: '',
  description: '',
  status: 'Active'
}

export default function SyllabusPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [filterClass, setFilterClass] = useState('All')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editItem, setEditItem] = useState<SyllabusItem | null>(null)
  const [viewItem, setViewItem] = useState<SyllabusItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<SyllabusItem | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { 
      router.push('/login')
      return 
    }
    setUserRole(Number(role))
    
    // Fetch data only once on mount
    let mounted = true
    const loadData = async () => {
      if (mounted) {
        await Promise.all([fetchSyllabus(), fetchClasses()])
      }
    }
    loadData()
    
    return () => { mounted = false }
  }, []) // Empty dependency array - runs only once

  const fetchSyllabus = async () => {
    try {
      setLoading(true)
      const result = await syllabusApi.list()
      if (result.success) setSyllabus((result.data as any) || [])
    } catch (err) {
      console.error('Failed to fetch syllabus:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const result = await configApi.getClasses()
      if (result.success) setClasses(['All', ...((result.data as any) || [])])
    } catch {
      setClasses(['All', 'Nursery', 'LKG', 'UKG'])
    }
  }

  const openAdd = () => {
    setEditItem(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEdit = (item: SyllabusItem) => {
    setEditItem(item)
    setFormData({
      studentClass: item.class,
      subject: item.subject,
      topics: item.topics,
      description: item.description || '',
      status: item.status
    })
    setShowModal(true)
  }

  const openView = (item: SyllabusItem) => {
    setViewItem(item)
    setShowViewModal(true)
  }

  const openDelete = (item: SyllabusItem) => {
    setDeleteItem(item)
    setShowDeleteModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      if (editItem) {
        const result = await syllabusApi.update(editItem.id, formData)
        if (result.success) {
          setMessage({ type: 'success', text: 'Syllabus updated successfully!' })
          setShowModal(false)
          fetchSyllabus()
        } else {
          setMessage({ type: 'error', text: (result as any).error || 'Failed to update' })
        }
      } else {
        const result = await syllabusApi.create(formData)
        if (result.success) {
          setMessage({ type: 'success', text: 'Syllabus added successfully!' })
          setShowModal(false)
          fetchSyllabus()
        } else {
          setMessage({ type: 'error', text: (result as any).error || 'Failed to create' })
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(deleteItem.id)
    try {
      const result = await syllabusApi.delete(deleteItem.id)
      if (result.success) {
        setMessage({ type: 'success', text: 'Syllabus deleted successfully!' })
        setShowDeleteModal(false)
        fetchSyllabus()
      } else {
        setMessage({ type: 'error', text: (result as any).error || 'Failed to delete' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete. Please try again.' })
    } finally {
      setDeleting(null)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  if (userRole === null || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const isAdmin = userRole === 6
  const filtered = filterClass === 'All' ? syllabus : syllabus.filter(s => s.class === filterClass)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Syllabus</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex flex-wrap gap-3 justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Syllabus Overview</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Class filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {isAdmin && (
                <button
                  onClick={openAdd}
                  className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm font-medium"
                >
                  + Add Syllabus
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-14 h-14 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-lg font-medium">No syllabus entries found</p>
              {isAdmin && <p className="text-sm mt-1">Click "+ Add Syllabus" to get started</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topics</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.class}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.topics}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm flex items-center gap-3">
                        <button
                          onClick={() => openView(item)}
                          className="text-[#5e3a9e] hover:underline font-medium"
                        >
                          View
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(item)}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDelete(item)}
                              className="text-red-600 hover:underline font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">{editItem ? 'Edit Syllabus' : 'Add Syllabus'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  required
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Select Class</option>
                  {classes.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics *</label>
                <input
                  required
                  type="text"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="e.g. Numbers 1-20, Shapes, Patterns"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional additional details..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#5e3a9e] text-white rounded-lg hover:bg-[#4a2d7e] disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Add Syllabus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Syllabus Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Class</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewItem.class}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Subject</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewItem.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                    viewItem.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>{viewItem.status}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Topics</p>
                <p className="text-sm text-gray-900 mt-1">{viewItem.topics}</p>
              </div>
              {viewItem.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Description</p>
                  <p className="text-sm text-gray-700 mt-1">{viewItem.description}</p>
                </div>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="mt-2 w-full px-4 py-2 bg-[#5e3a9e] text-white rounded-lg hover:bg-[#4a2d7e] text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-red-600">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the <strong>{deleteItem.subject}</strong> syllabus for <strong>{deleteItem.class}</strong>?
              </p>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting !== null}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-700 border-2 border-red-400 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm font-medium"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
