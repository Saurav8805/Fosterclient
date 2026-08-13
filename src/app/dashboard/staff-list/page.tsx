'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { staffApi } from '@/lib/api'

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
    assignedClass: '',
    assignedSection: '',
    joiningDate: '',
    salary: ''
  })

  // Add Staff Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [assignedClasses, setAssignedClasses] = useState<{ assignedClass: string; assignedSection: string; teacherName: string }[]>([])
  const [addCredentials, setAddCredentials] = useState<{ mobile: string; password: string } | null>(null)
  const [addFormData, setAddFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    designation: 'Teacher',
    department: 'Teaching',
    assignedClass: '',
    assignedSection: '',
    joiningDate: '',
    salary: '',
    address: ''
  })

  const classList = ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']
  const sectionList = ['A', 'B', 'C', 'D']

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/login')
      return
    }
    setUserRole(Number(role))
    
    fetchStaff()
    fetchAssignedClasses()
  }, [])

  const fetchAssignedClasses = async () => {
    try {
      const res = await staffApi.getAssignedClasses() as { success: boolean; data?: any[] }
      if (res.success && res.data) {
        setAssignedClasses(res.data)
      }
    } catch (e) {
      console.error('Failed to fetch assigned classes:', e)
    }
  }

  const fetchStaff = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching staff from backend API...')
      
      const result = await staffApi.list()
      
      console.log('📊 Staff API response:', { 
        success: result.success, 
        count: result.data?.length
      })

      if (result.success) {
        setStaffMembers(result.data || [])
        console.log('✅ Staff updated in state:', result.data?.length || 0)
      } else {
        console.error('Failed to fetch staff:', result.error)
        setMessage({ type: 'error', text: result.error || 'Failed to load staff' })
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      setMessage({ type: 'error', text: 'Failed to load staff - network error' })
    } finally {
      setLoading(false)
    }
  }

  const isPairTaken = (cls: string, sec: string) => {
    return assignedClasses.some(a => a.assignedClass === cls && a.assignedSection === sec)
  }

  const getAssignedTeacherName = (cls: string, sec: string) => {
    const found = assignedClasses.find(a => a.assignedClass === cls && a.assignedSection === sec)
    return found ? found.teacherName : null
  }

  const handleOpenAddModal = () => {
    setAddFormData({
      fullName: '',
      mobile: '',
      email: '',
      designation: 'Teacher',
      department: 'Teaching',
      assignedClass: '',
      assignedSection: '',
      joiningDate: '',
      salary: '',
      address: ''
    })
    setAddCredentials(null)
    fetchAssignedClasses()
    setShowAddModal(true)
  }

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddCredentials(null)

    try {
      let role = 7
      if (['Principal', 'Vice-Principal', 'Admin'].includes(addFormData.designation)) {
        role = 6
      }

      const res = await staffApi.add({
        ...addFormData,
        role
      }) as { success: boolean; data?: any; error?: string }

      if (res.success) {
        setMessage({ type: 'success', text: '✅ Staff member added successfully!' })
        if (res.data?.credentials) {
          setAddCredentials(res.data.credentials)
        }
        await fetchStaff()
        await fetchAssignedClasses()
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to add staff member' })
      }
    } catch (err) {
      console.error('Add staff error:', err)
      setMessage({ type: 'error', text: 'Failed to add staff member' })
    } finally {
      setAddLoading(false)
    }
  }

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff)
    setFormData({
      fullName: staff.user?.full_name || '',
      mobile: staff.user?.mobile || '',
      email: staff.user?.email || '',
      designation: staff.designation || '',
      department: staff.department || '',
      assignedClass: staff.assigned_class || '',
      assignedSection: staff.assigned_section || '',
      joiningDate: staff.date_of_joining || '',
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
      console.log('🔄 Updating staff member:', formData)
      
      const result = await staffApi.update(selectedStaff.id, {
        userId: selectedStaff.user_id,
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        designation: formData.designation,
        department: formData.department,
        assignedClass: formData.assignedClass,
        assignedSection: formData.assignedSection,
        joiningDate: formData.joiningDate,
        salary: formData.salary
      })

      console.log('📝 Update response:', result)

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
      console.log('🗑️ Deleting staff member:', selectedStaff.user?.full_name)
      
      const result = await staffApi.delete(selectedStaff.id)

      console.log('📝 Delete response:', result)

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

  const handleToggleStatus = async (staff: any) => {
    const isCurrentlyDisabled = staff.status === 'Disabled' || staff.is_active === false || staff.user?.status === 'Disabled' || staff.user?.is_active === false
    const targetStatus = isCurrentlyDisabled ? 'Active' : 'Disabled'

    try {
      const res = await staffApi.toggleStatus(staff.id, targetStatus)
      if (res.success) {
        setMessage({ 
          type: 'success', 
          text: `Status of ${staff.user?.full_name || 'staff member'} changed to ${targetStatus}.` 
        })
        setStaffMembers(prev => prev.map(s => {
          if (s.id === staff.id) {
            return {
              ...s,
              status: targetStatus,
              is_active: targetStatus === 'Active',
              user: {
                ...(s.user || {}),
                status: targetStatus,
                is_active: targetStatus === 'Active'
              }
            }
          }
          return s
        }))
        fetchStaff()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to change status' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update status' })
    }
  }

  // Filter staff by designation & exclude Principal/Vice-Principal/Admin
  const filteredStaff = staffMembers.filter(staff => {
    const roleNum = staff.user?.role
    const desig = (staff.designation || '').toLowerCase()
    const isPrincipalOrAdmin = roleNum === 6 || desig.includes('principal') || desig.includes('admin')
    if (isPrincipalOrAdmin) return false
    
    if (filterDesignation !== 'All') {
      return staff.designation === filterDesignation
    }
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage staff members and assign classes</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Staff Member
          </button>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="All">All Staff</option>
                  <option value="Teacher">Teacher</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Class</th>
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
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <div>{staff.user?.full_name || 'N/A'}</div>
                        {staff.assigned_class || staff.assignedClass ? (
                          <div className="text-xs text-blue-600 font-semibold mt-0.5">
                            {staff.assigned_class || staff.assignedClass} - {staff.assigned_section || staff.assignedSection || 'A'}
                          </div>
                        ) : (staff.designation === 'Teacher' || staff.department === 'Teaching') ? (
                          <div className="text-xs text-amber-600 font-normal mt-0.5">Unassigned</div>
                        ) : (
                          <div className="text-xs text-gray-400 font-normal mt-0.5">{staff.department || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.user?.mobile || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-700">
                        {staff.assigned_class || staff.assignedClass ? `${staff.assigned_class || staff.assignedClass} - ${staff.assigned_section || staff.assignedSection || 'A'}` : (staff.designation === 'Teacher' || staff.department === 'Teaching' ? 'Unassigned' : '-')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {staff.status === 'Disabled' || staff.is_active === false || staff.user?.status === 'Disabled' || staff.user?.is_active === false ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                            Disabled
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleEdit(staff)}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          {staff.status === 'Disabled' || staff.is_active === false || staff.user?.status === 'Disabled' || staff.user?.is_active === false ? (
                            <button 
                              onClick={() => handleToggleStatus(staff)}
                              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 rounded text-xs font-bold transition cursor-pointer"
                            >
                              Enable Account
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(staff)}
                              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 rounded text-xs font-bold transition cursor-pointer"
                            >
                              Disable Account
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No staff members found{filterDesignation !== 'All' ? ' for "' + filterDesignation + '" designation' : ''}.
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
                    <option value="Teacher">Teacher</option>
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
                    <option value="Teaching">Teaching</option>
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
                  className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-400 rounded-lg hover:bg-blue-100 disabled:opacity-50 font-medium"
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
              Are you sure you want to delete <strong>{selectedStaff?.user?.full_name}</strong>? 
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
                className="px-4 py-2 bg-red-50 text-red-700 border-2 border-red-400 rounded-lg hover:bg-red-100 disabled:opacity-50 font-medium"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-5">
              <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {addCredentials && (
              <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
                <p className="text-sm font-semibold text-green-900 mb-2">🎉 Staff Member Created! Login Credentials:</p>
                <div className="space-y-1 bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-gray-700">Mobile (Username): <span className="font-mono font-bold text-gray-900">{addCredentials.mobile}</span></p>
                  <p className="text-sm text-gray-700">Generated Password: <span className="font-mono font-bold text-gray-900">{addCredentials.password}</span></p>
                </div>
                <p className="text-xs text-green-800 mt-2">⚠️ Share these credentials with the staff member.</p>
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.fullName}
                    onChange={(e) => setAddFormData({ ...addFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number * (Username)</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={addFormData.mobile}
                    onChange={(e) => setAddFormData({ ...addFormData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="staff@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <select
                    required
                    value={addFormData.designation}
                    onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={addFormData.department}
                    onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Teaching">Teaching</option>
                    <option value="Administration">Administration</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class (For Teachers)</label>
                  <select
                    value={addFormData.assignedClass}
                    onChange={(e) => setAddFormData({ ...addFormData, assignedClass: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class to Assign</option>
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Section</label>
                  <select
                    value={addFormData.assignedSection}
                    onChange={(e) => setAddFormData({ ...addFormData, assignedSection: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Section</option>
                    {sectionList.map(sec => {
                      const taken = addFormData.assignedClass ? isPairTaken(addFormData.assignedClass, sec) : false;
                      const teacher = addFormData.assignedClass ? getAssignedTeacherName(addFormData.assignedClass, sec) : null;
                      return (
                        <option key={sec} value={sec} disabled={taken}>
                          Section {sec} {taken ? '❌ (' + teacher + ')' : '✓'}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={addFormData.joiningDate}
                    onChange={(e) => setAddFormData({ ...addFormData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
                  <input
                    type="number"
                    value={addFormData.salary}
                    onChange={(e) => setAddFormData({ ...addFormData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Monthly salary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {addLoading ? 'Creating...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
