'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [filterDesignation, setFilterDesignation] = useState<string>('All')
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    designation: '',
    department: '',
    joiningDate: '',
    salary: ''
  })

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role || Number(role) !== 8) {
      router.push('/dashboard')
      return
    }
    setUserRole(Number(role))
    fetchStaff()
  }, [router])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/list')
      const result = await response.json()

      if (result.success) {
        setStaffMembers(result.data)
      } else {
        console.error('Failed to fetch staff:', result.error)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff)
    setFormData({
      fullName: staff.full_name || '',
      mobile: staff.mobile || '',
      email: staff.email || '',
      designation: staff.designation || '',
      department: staff.department || '',
      joiningDate: staff.joining_date || '',
      salary: staff.salary ? String(staff.salary) : ''
    })
    setShowEditModal(true)
    setMessage(null)
  }

  const handleDelete = (staff: any) => {
    setSelectedStaff(staff)
    setShowDeleteModal(true)
    setMessage(null)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/staff/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaff.id,
          userId: selectedStaff.user_id,
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          designation: formData.designation,
          department: formData.department,
          joiningDate: formData.joiningDate,
          salary: formData.salary
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Staff member updated successfully!' })
        await fetchStaff()
        setTimeout(() => {
          setShowEditModal(false)
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update staff member' })
      }
    } catch (error) {
      console.error('Update error:', error)
      setMessage({ type: 'error', text: 'Failed to update staff member' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedStaff) return

    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/staff/delete?staffId=${selectedStaff.id}&userId=${selectedStaff.user_id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Staff member deleted successfully!' })
        await fetchStaff()
        setShowDeleteModal(false)
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete staff member' })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ type: 'error', text: 'Failed to delete staff member' })
    } finally {
      setDeleting(false)
    }
  }

  if (userRole === null || loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Filter staff by designation
  const filteredStaff = filterDesignation === 'All' 
    ? staffMembers 
    : staffMembers.filter(staff => staff.designation === filterDesignation)

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Staff List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Success/Error Message */}
        {message && !showEditModal && !showDeleteModal && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Staff Members</h2>
              
              {/* Filter Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter by Designation:</label>
                <select
                  value={filterDesignation}
                  onChange={(e) => setFilterDesignation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Senior Teacher">Senior Teacher</option>
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <p className="text-sm text-gray-600 mt-3">
              Showing {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, index) => (
                    <tr key={staff.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{staff.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.mobile}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {userRole === 8 && (
                          <>
                            <button 
                              onClick={() => handleEdit(staff)}
                              className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(staff)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No staff members found{filterDesignation !== 'All' ? ` for "${filterDesignation}" designation` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Edit Staff Member</h3>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6">
              {message && (
                <div className={`mb-4 p-3 rounded ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="edit-fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    id="edit-fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="edit-mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    id="edit-mobile"
                    name="mobile"
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="edit-designation" className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <select
                    id="edit-designation"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Designation</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Senior Teacher">Senior Teacher</option>
                    <option value="Head Teacher">Head Teacher</option>
                    <option value="Principal">Principal</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Admin Staff">Admin Staff</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    id="edit-department"
                    name="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Pre-Primary">Pre-Primary</option>
                    <option value="Nursery">Nursery</option>
                    <option value="Administration">Administration</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                {/* Joining Date */}
                <div>
                  <label htmlFor="edit-joiningDate" className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    id="edit-joiningDate"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label htmlFor="edit-salary" className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
                  <input
                    id="edit-salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setMessage(null)
                  }}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            
            {message && (
              <div className={`mb-4 p-3 rounded ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedStaff?.full_name}</strong>? 
              This action cannot be undone and will permanently remove all associated data.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setMessage(null)
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
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
