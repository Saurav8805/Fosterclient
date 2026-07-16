'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { homeworkApi, configApi, usersApi } from '@/lib/api'

interface Homework {
  id: string
  title?: string
  description: string
  class: string
  subject: string
  due_date: string
  assigned_by: string
  created_at: string
  teacher?: {
    id: string
    full_name: string
  }
}

export default function HomeworkPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userClass, setUserClass] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState('All')
  const [classes, setClasses] = useState<string[]>(['All'])
  const [homeworkList, setHomeworkList] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editItem, setEditItem] = useState<Homework | null>(null)
  const [viewItem, setViewItem] = useState<Homework | null>(null)
  const [deleteItem, setDeleteItem] = useState<Homework | null>(null)

  const [formData, setFormData] = useState({
    studentClass: '',
    subject: '',
    description: '',
    assignedDate: '',
    dueDate: ''
  })

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const uid = localStorage.getItem('userId')
    if (!role || !uid) { router.push('/login'); return }
    setUserRole(Number(role))
    setUserId(uid)
    
    // Fetch data once on mount
    const loadData = async () => {
      await fetchClasses()
      
      // For students, fetch their class from profile
      if (Number(role) === 10) {
        try {
          const profileResult = await usersApi.getProfile(uid)
          if (profileResult.success && profileResult.data) {
            const studentClass = profileResult.data.class || profileResult.data.student_class
            if (studentClass) {
              setUserClass(studentClass)
              setSelectedClass(studentClass) // Auto-filter to student's class
            }
          }
        } catch (error) {
          console.error('Failed to fetch student profile:', error)
        }
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    if (userRole !== null) {
      fetchHomework()
    }
  }, [userRole, selectedClass])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const result = selectedClass === 'All' 
        ? await homeworkApi.list()
        : await homeworkApi.list(selectedClass)

      if (result.success) {
        setHomeworkList(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch homework:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const result = await configApi.getClasses()
      if (result.success && result.data?.length > 0) {
        setClasses(['All', ...result.data])
      } else {
        setClasses(['All', 'Nursery', 'LKG', 'UKG'])
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      setClasses(['All', 'Nursery', 'LKG', 'UKG'])
    }
  }

  const openAssignModal = () => {
    console.log('🎯 Assign Homework button clicked!')
    setEditItem(null)
    const today = new Date().toISOString().split('T')[0]
    setFormData({
      studentClass: '',
      subject: '',
      description: '',
      assignedDate: today, // Default to today
      dueDate: ''
    })
    setShowAssignModal(true)
    console.log('✅ showAssignModal set to:', true)
  }

  const openEditModal = (item: Homework) => {
    setEditItem(item)
    setFormData({
      studentClass: item.class,
      subject: item.subject,
      description: item.description,
      assignedDate: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      dueDate: item.due_date.split('T')[0] // Format YYYY-MM-DD
    })
    setShowAssignModal(true)
  }

  const openViewModal = (item: Homework) => {
    setViewItem(item)
    setShowViewModal(true)
  }

  const openDeleteModal = (item: Homework) => {
    setDeleteItem(item)
    setShowDeleteModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (editItem) {
        // Update existing homework
        const result = await homeworkApi.update(editItem.id, {
          ...formData,
          class: formData.studentClass
        })
        if (result.success) {
          setMessage({ type: 'success', text: 'Homework updated successfully!' })
          setShowAssignModal(false)
          await fetchHomework()
        } else {
          setMessage({ type: 'error', text: (result as any).error || 'Failed to update homework' })
        }
      } else {
        // Create new homework
        console.log('📤 Sending homework data:', {
          studentClass: formData.studentClass,
          subject: formData.subject,
          description: formData.description,
          dueDate: formData.dueDate,
          assignedBy: userId
        })
        
        const result = await homeworkApi.create({
          studentClass: formData.studentClass,
          subject: formData.subject,
          description: formData.description,
          dueDate: formData.dueDate,
          assignedBy: userId
        })
        
        console.log('📥 API response:', result)
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Homework assigned successfully!' })
          setShowAssignModal(false)
          await fetchHomework()
        } else {
          setMessage({ type: 'error', text: (result as any).error || 'Failed to assign homework' })
        }
      }
    } catch (error) {
      console.error('Homework operation error:', error)
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(deleteItem.id)
    try {
      const result = await homeworkApi.delete(deleteItem.id)
      if (result.success) {
        setMessage({ type: 'success', text: 'Homework deleted successfully!' })
        setShowDeleteModal(false)
        await fetchHomework()
      } else {
        setMessage({ type: 'error', text: (result as any).error || 'Failed to delete homework' })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ type: 'error', text: 'Failed to delete. Please try again.' })
    } finally {
      setDeleting(null)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const isStudent = userRole === 10

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
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

        {!isStudent && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-4">
              <label className="font-medium">Select Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
              <button 
                onClick={openAssignModal}
                className="ml-auto bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm"
              >
                + Assign Homework
              </button>
            </div>
          </div>
        )}

        {isStudent && userClass && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-purple-700 font-medium">📚 Showing homework for your class:</span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-lg font-semibold">{userClass}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Homework List</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading homework...</div>
          ) : homeworkList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No homework assigned yet.</p>
              {!isStudent && <p className="text-sm mt-2">Click "+ Assign Homework" to get started</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {homeworkList.map((hw) => (
                    <tr key={hw.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-xs">
                        <span className="line-clamp-2">{hw.description}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.class}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {hw.created_at ? new Date(hw.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(hw.due_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.teacher?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => openViewModal(hw)}
                          className="text-[#5e3a9e] hover:underline mr-3 font-medium"
                        >
                          View
                        </button>
                        {!isStudent && (
                          <>
                            <button 
                              onClick={() => openEditModal(hw)}
                              className="text-blue-600 hover:underline mr-3 font-medium"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => openDeleteModal(hw)}
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

      {/* Assign/Edit Homework Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">
                {editItem ? 'Edit Homework' : 'Assign Homework'}
              </h3>
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
                  placeholder="e.g., Mathematics, English, Science"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Homework Description *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter homework details, instructions, and requirements..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.assignedDate}
                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min={formData.assignedDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#5e3a9e] text-white rounded-lg hover:bg-[#4a2d7e] disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Homework Modal */}
      {showViewModal && viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Homework Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {viewItem.title && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Title</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewItem.title}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Class</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewItem.class}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Subject</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewItem.subject}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Due Date</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(viewItem.due_date).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Description</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{viewItem.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Assigned By</p>
                <p className="text-sm text-gray-900 mt-1">{viewItem.teacher?.full_name || 'N/A'}</p>
              </div>
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
                Are you sure you want to delete the <strong>{deleteItem.subject}</strong> homework for <strong>{deleteItem.class}</strong>?
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
