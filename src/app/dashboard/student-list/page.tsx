'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

export default function StudentListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [sections, setSections] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    class: '',
    section: '',
    rollNo: '',
    teacherId: ''
  })

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { 
      router.push('/login')
      return 
    }
    setUserRole(Number(role))
    
    // Only admin and faculty can access
    if (Number(role) !== 6 && Number(role) !== 8) {
      router.push('/dashboard')
      return
    }
    
    fetchStudents()
    fetchTeachers()
    fetchClasses()
    fetchSections()
  }, [router])

  // Enhanced event listeners for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      console.log('Student list update triggered')
      fetchStudents()
    }

    // Method 1: Custom window event
    window.addEventListener('studentAdmitted', handleUpdate)
    window.addEventListener('forceStudentRefresh', handleUpdate)
    window.addEventListener('studentDeleted', handleUpdate)
    
    // Method 2: BroadcastChannel API (works across tabs)
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('student_updates')
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'STUDENT_ADMITTED' || event.data.type === 'STUDENT_DELETED') {
          console.log('BroadcastChannel: Student list update')
          handleUpdate()
        }
      })
    } catch (e) {
      console.log('BroadcastChannel not supported')
    }

    // Method 3: LocalStorage event (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'studentListRefresh') {
        console.log('LocalStorage: Student list refresh triggered')
        handleUpdate()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Method 4: Visibility change (when user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refreshing student list')
        handleUpdate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('studentAdmitted', handleUpdate)
      window.removeEventListener('forceStudentRefresh', handleUpdate)
      window.removeEventListener('studentDeleted', handleUpdate)
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (channel) {
        channel.close()
      }
    }
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      console.log('Fetching students from API...')
      
      const response = await fetch('/api/students/list', {
        cache: 'no-store', // Prevent caching
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const result = await response.json()
      
      console.log('Students API response:', { 
        success: result.success, 
        count: result.count,
        timestamp: result.timestamp 
      })
      
      if (result.success) {
        setStudents(result.data)
        if (!result.serviceKeyConfigured) {
          setMessage('⚠️ Service role key not configured. Some features may be limited. Please check SETUP-SERVICE-KEY.md for setup instructions.')
        } else {
          setMessage('')
        }
      } else {
        console.error('Failed to fetch students:', result.error)
        setMessage(`Error: ${result.error}`)
      }
    } catch (err) {
      console.error('Network error:', err)
      setMessage('Failed to load students - network error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/students/teachers')
      const result = await response.json()
      if (result.success) {
        setTeachers(result.data)
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/config/classes')
      const result = await response.json()
      if (result.success) {
        setClasses(['All', ...result.data])
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
      setClasses(['All', 'Nursery', 'LKG', 'UKG']) // Fallback
    }
  }

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/config/sections')
      const result = await response.json()
      if (result.success) {
        setSections(result.data)
      }
    } catch (err) {
      console.error('Error fetching sections:', err)
      setSections(['A', 'B', 'C']) // Fallback
    }
  }

  const handleEdit = (student: any) => {
    setSelectedStudent(student)
    setFormData({
      fullName: student.user?.full_name || '',
      mobile: student.user?.mobile || '',
      class: student.class || '',
      section: student.section || '',
      rollNo: student.roll_no ? String(student.roll_no) : '',
      teacherId: student.teacher_id || ''
    })
    setShowModal(true)
    setMessage('')
  }

  const handleDelete = (student: any) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
    setMessage('')
  }

  const confirmDelete = async () => {
    if (!selectedStudent) return

    setDeleting(true)
    setMessage('')

    try {
      console.log('🗑️ Deleting student:', selectedStudent.user?.full_name)
      
      const response = await fetch(`/api/students/delete?studentId=${selectedStudent.id}&userId=${selectedStudent.user_id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Student deleted successfully!')
        
        // Refresh the student list
        await fetchStudents()
        
        // Send refresh signals to other tabs/components
        window.dispatchEvent(new CustomEvent('studentDeleted', { 
          detail: { deletedStudent: selectedStudent.user?.full_name } 
        }))
        
        // BroadcastChannel for cross-tab updates
        try {
          const channel = new BroadcastChannel('student_updates')
          channel.postMessage({ 
            type: 'STUDENT_DELETED', 
            timestamp: Date.now(),
            studentName: selectedStudent.user?.full_name 
          })
          channel.close()
        } catch (e) {
          console.log('BroadcastChannel not supported')
        }
        
        setShowDeleteModal(false)
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('❌ Failed to delete student. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/students/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          userId: selectedStudent.user_id,
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Student updated successfully!')
        fetchStudents() // Refresh the list
        setTimeout(() => {
          setShowModal(false)
          setMessage('')
        }, 1500)
      } else {
        setMessage(result.error || 'Failed to update student')
      }
    } catch (error) {
      setMessage('Failed to update student. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const filtered = selectedClass === 'All'
    ? students
    : students.filter(s => s.class === selectedClass)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Student List</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.includes('Error:') || message.includes('Failed') 
            ? 'bg-red-50 text-red-800 border-red-200' 
            : message.includes('⚠️')
            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {message}
          {message.includes('Service role key') && (
            <div className="mt-2 text-sm">
              <p>The app will work with limited functionality until the service role key is configured.</p>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">All Students</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  console.log('Manual refresh clicked')
                  fetchStudents()
                }}
                disabled={loading}
                className="ml-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '🔄' : '↻'} Refresh
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      No students found{selectedClass !== 'All' ? ` for ${selectedClass}` : ''}
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.roll_no || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.user?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.user?.mobile || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.section || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.teacher?.full_name || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                        >
                          Edit
                        </button>
                        {userRole === 8 && ( // Only admin (role 8) can delete
                          <button 
                            onClick={() => handleDelete(student)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Simple Edit Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Edit Student</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {message && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
                  {message}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Class</option>
                    {classes.filter(c => c !== 'All').map((className) => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-red-600">⚠️ Confirm Delete</h3>
            </div>
            <div className="p-6">
              {message && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  message.includes('✅') 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {message}
                </div>
              )}
              
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{selectedStudent.user?.full_name}</strong>?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Warning:</strong> This action will permanently delete:
                </p>
                <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                  <li>Student record (Roll No: {selectedStudent.roll_no})</li>
                  <li>User account (Mobile: {selectedStudent.user?.mobile})</li>
                  <li>All associated data</li>
                </ul>
                <p className="text-sm text-red-800 mt-2 font-semibold">
                  This action cannot be undone!
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setMessage('')
                  }}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
