'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { staffApi } from '@/lib/api'
import { validateMobile, validateEmail, validateJoiningDate } from '@/utils/validation'

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
  const [assignedClasses, setAssignedClasses] = useState<{ staffId?: string; assignedClass: string; assignedSection: string; teacherName: string }[]>([])
  const [addCredentials, setAddCredentials] = useState<{ mobile: string; password: string } | null>(null)
  const [classList, setClassList] = useState<string[]>([])
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

  const sectionList = ['A', 'B', 'C', 'D']
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  // Staff Full Profile Modal state
  const [showStaffProfileModal, setShowStaffProfileModal] = useState(false)
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<any>(null)
  const [staffProfileTab, setStaffProfileTab] = useState<'profile' | 'attendance' | 'professional'>('profile')
  const [staffAttendanceLogs, setStaffAttendanceLogs] = useState<any[]>([])
  const [staffAttendanceStats, setStaffAttendanceStats] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/login')
      return
    }
    setUserRole(Number(role))
    
    fetchStaff()
    fetchAssignedClasses()
    fetchClassList()
  }, [])

  const fetchClassList = async () => {
    try {
      console.log('🔄 [v2.0] Fetching class list from database...')
      const { configApi } = await import('@/lib/api')
      const res = await configApi.getClasses() as { success: boolean; data?: string[] }
      console.log('📊 [v2.0] Class list response:', res)
      if (res.success && res.data) {
        console.log('✅ [v2.0] Setting class list:', res.data)
        setClassList(res.data)
      } else {
        console.warn('⚠️ [v2.0] No class data received')
        setClassList([])
      }
    } catch (e) {
      console.error('❌ [v2.0] Failed to fetch class list:', e)
      setClassList([])
    }
  }

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
    const assignments = assignedClasses.filter(a => a.assignedClass === cls && a.assignedSection === sec)
    // Allow up to 2 teachers per class-section
    return assignments.length >= 2
  }

  const getAssignedTeacherNames = (cls: string, sec: string) => {
    const assignments = assignedClasses.filter(a => a.assignedClass === cls && a.assignedSection === sec)
    if (assignments.length === 0) return null
    if (assignments.length === 1) return `${assignments[0].teacherName} (1 teacher assigned)`
    return `${assignments[0].teacherName} & ${assignments[1].teacherName} (2 teachers)`
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
    
    // Clear previous errors
    setAddErrors({})
    setAddCredentials(null)
    
    // Validate all fields
    const validationErrors: Record<string, string> = {}
    
    // Validate mobile number (required)
    const mobileResult = validateMobile(addFormData.mobile)
    if (!mobileResult.valid) {
      validationErrors.mobile = mobileResult.error!
    }
    
    // Validate email (optional, but if provided must be valid)
    if (addFormData.email) {
      const emailResult = validateEmail(addFormData.email, false)
      if (!emailResult.valid) {
        validationErrors.email = emailResult.error!
      }
    }
    
    // Validate joining date (optional, but if provided must be valid)
    if (addFormData.joiningDate) {
      const joiningResult = validateJoiningDate(addFormData.joiningDate)
      if (!joiningResult.valid) {
        validationErrors.joiningDate = joiningResult.error!
      }
    }
    
    // If there are validation errors, show them and stop
    if (Object.keys(validationErrors).length > 0) {
      setAddErrors(validationErrors)
      setMessage({ 
        type: 'error', 
        text: 'Please fix the validation errors before submitting.' 
      })
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0]
      document.getElementById(`add-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    setAddLoading(true)

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

  const handleOpenStaffProfile = async (staff: any) => {
    console.log('📋 Opening staff profile:', staff)
    console.log('👤 Staff user data:', staff.user)
    console.log('🖼️ Profile image URL:', staff.user?.profile_image_url)
    
    setSelectedStaffProfile(staff)
    setShowStaffProfileModal(true)
    setStaffProfileTab('profile')
    setProfileLoading(true)
    
    try {
      // Fetch staff attendance records
      const attendanceResult = await staffApi.getAttendance({ staffId: staff.id })
      if (attendanceResult.success) {
        setStaffAttendanceLogs(attendanceResult.data?.attendance || [])
        setStaffAttendanceStats(attendanceResult.data?.stats || null)
      }
    } catch (error) {
      console.error('Failed to load staff attendance:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleDelete = (staff: any) => {
    setSelectedStaff(staff)
    setShowDeleteModal(true)
    setMessage(null)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

    // Clear previous errors
    setErrors({})
    setMessage(null)
    
    // Validate all fields
    const validationErrors: Record<string, string> = {}
    
    // Validate mobile number (required)
    const mobileResult = validateMobile(formData.mobile)
    if (!mobileResult.valid) {
      validationErrors.mobile = mobileResult.error!
    }
    
    // Validate email (optional, but if provided must be valid)
    if (formData.email) {
      const emailResult = validateEmail(formData.email, false)
      if (!emailResult.valid) {
        validationErrors.email = emailResult.error!
      }
    }
    
    // Validate joining date (optional, but if provided must be valid)
    if (formData.joiningDate) {
      const joiningResult = validateJoiningDate(formData.joiningDate)
      if (!joiningResult.valid) {
        validationErrors.joiningDate = joiningResult.error!
      }
    }
    
    // If there are validation errors, show them and stop
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setMessage({ 
        type: 'error', 
        text: 'Please fix the validation errors before submitting.' 
      })
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0]
      document.getElementById(`edit-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)

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
    const isPrincipalOrAdmin = roleNum === 6 || roleNum === 8 || desig.includes('principal') || desig.includes('admin')
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
                  <option value="Admin">Admin</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, index) => (
                    <tr key={staff.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {(staff.user?.full_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <button 
                              onClick={() => handleOpenStaffProfile(staff)}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition cursor-pointer hover:underline text-left"
                            >
                              {staff.user?.full_name || 'N/A'}
                            </button>
                            <p className="text-xs text-gray-500">{staff.designation || 'Staff'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.user?.mobile || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-700">
                        {staff.class_assignments && staff.class_assignments.length > 0 ? (
                          <div className="space-y-1">
                            {staff.class_assignments.map((assignment: any, idx: number) => (
                              <div key={idx}>
                                <div>{assignment.class} - {assignment.section}</div>
                                {(() => {
                                  const coTeachers = assignedClasses.filter(a => 
                                    a.assignedClass === assignment.class && 
                                    a.assignedSection === assignment.section &&
                                    a.staffId !== staff.id
                                  );
                                  if (coTeachers.length > 0) {
                                    return (
                                      <div className="text-xs text-purple-600 font-normal">
                                        + {coTeachers[0].teacherName}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            ))}
                          </div>
                        ) : (staff.assigned_class || staff.assignedClass) ? (
                          <div>{staff.assigned_class || staff.assignedClass} - {staff.assigned_section || staff.assignedSection || 'A'}</div>
                        ) : (staff.designation === 'Teacher' || staff.department === 'Teaching' ? 'Unassigned' : '-')}
                      </td>
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
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleEdit(staff)}
                            className="px-2 py-0.5 border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium transition cursor-pointer whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(staff)}
                            className="px-2 py-0.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[10px] font-medium transition cursor-pointer whitespace-nowrap"
                            title="Delete staff member permanently"
                          >
                            Delete
                          </button>
                          {staff.status === 'Disabled' || staff.is_active === false || staff.user?.status === 'Disabled' || staff.user?.is_active === false ? (
                            <button 
                              onClick={() => handleToggleStatus(staff)}
                              className="px-2 py-0.5 border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 rounded text-[10px] font-medium transition cursor-pointer whitespace-nowrap"
                            >
                              Enable
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(staff)}
                              className="px-2 py-0.5 border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded text-[10px] font-medium transition cursor-pointer whitespace-nowrap"
                            >
                              Disable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                    onChange={(e) => {
                      const designation = e.target.value;
                      let department = formData.department;
                      
                      // Auto-assign department based on designation
                      if (designation === 'Admin') {
                        department = 'Administration';
                      } else if (designation === 'Principal') {
                        department = 'Head of School';
                      } else if (designation === 'Vice Principal') {
                        department = 'Deputy Head of School';
                      } else if (designation === 'Teacher') {
                        department = 'Faculty';
                      } else if (designation === 'Support Staff') {
                        department = 'Support Department';
                      }
                      
                      setFormData({ ...formData, designation, department });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Designation</option>
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    id="edit-department"
                    name="department"
                    value={formData.department}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-assigned based on designation"
                  />
                </div>

                {/* Assign Class (For Teachers) */}
                <div>
                  <label htmlFor="edit-assignedClass" className="block text-sm font-medium text-gray-700 mb-1">Assign Class (For Teachers)</label>
                  <select
                    id="edit-assignedClass"
                    name="assignedClass"
                    value={formData.assignedClass}
                    onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Assign Section */}
                <div>
                  <label htmlFor="edit-assignedSection" className="block text-sm font-medium text-gray-700 mb-1">Assign Section</label>
                  <select
                    id="edit-assignedSection"
                    name="assignedSection"
                    value={formData.assignedSection}
                    onChange={(e) => setFormData({ ...formData, assignedSection: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Section</option>
                    {sectionList.map(sec => {
                      const taken = formData.assignedClass ? isPairTaken(formData.assignedClass, sec) : false;
                      const teachers = formData.assignedClass ? getAssignedTeacherNames(formData.assignedClass, sec) : null;
                      // Check if current staff is one of the assigned teachers
                      const currentStaffAssigned = assignedClasses.some(a => 
                        a.assignedClass === formData.assignedClass && 
                        a.assignedSection === sec && 
                        a.staffId === selectedStaff?.id
                      );
                      const isDisabled = taken && !currentStaffAssigned;
                      
                      return (
                        <option key={sec} value={sec} disabled={isDisabled}>
                          Section {sec} {isDisabled ? '❌ (' + teachers + ')' : teachers && !currentStaffAssigned ? '⚠️ (' + teachers + ')' : '✓'}
                        </option>
                      )
                    })}
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
                    onChange={(e) => {
                      const designation = e.target.value;
                      let department = addFormData.department;
                      
                      // Auto-assign department based on designation
                      if (designation === 'Admin') {
                        department = 'Administration';
                      } else if (designation === 'Principal') {
                        department = 'Head of School';
                      } else if (designation === 'Vice Principal') {
                        department = 'Deputy Head of School';
                      } else if (designation === 'Teacher') {
                        department = 'Faculty';
                      } else if (designation === 'Support Staff') {
                        department = 'Support Department';
                      }
                      
                      setAddFormData({ ...addFormData, designation, department });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Designation</option>
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={addFormData.department}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-assigned based on designation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Class (For Teachers) 
                    {classList.length > 0 && <span className="text-blue-600"> ({classList.length} classes available)</span>}
                    <span className="text-xs text-gray-500 ml-2">[v2.0 - Database]</span>
                  </label>
                  <select
                    value={addFormData.assignedClass}
                    onChange={(e) => setAddFormData({ ...addFormData, assignedClass: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class to Assign</option>
                    {classList.length === 0 ? (
                      <option disabled>⏳ Loading classes from database...</option>
                    ) : (
                      classList.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))
                    )}
                  </select>
                  {classList.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ No classes found in database. Please add classes first.</p>
                  )}
                  {classList.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">✅ Loaded {classList.length} classes from database</p>
                  )}
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
                      const teachers = addFormData.assignedClass ? getAssignedTeacherNames(addFormData.assignedClass, sec) : null;
                      return (
                        <option key={sec} value={sec} disabled={taken}>
                          Section {sec} {taken ? '❌ (' + teachers + ')' : teachers ? '⚠️ (' + teachers + ')' : '✓'}
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

      {/* Staff Full Profile Modal */}
      {showStaffProfileModal && selectedStaffProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-4xl overflow-hidden my-6">
            {/* Profile Banner Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedStaffProfile.user?.full_name || 'Staff Profile'}
                </h2>
                <p className="text-sm text-blue-100 mt-1 flex items-center gap-2">
                  <span>{selectedStaffProfile.designation || 'Staff'}</span>
                  <span>•</span>
                  <span>{selectedStaffProfile.department || 'N/A'}</span>
                </p>
              </div>
              <button
                onClick={() => setShowStaffProfileModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Profile Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50/50">
              {[
                { id: 'profile', label: '👤 Profile' },
                { id: 'attendance', label: '📊 Attendance' },
                { id: 'professional', label: '💼 Professional Info' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStaffProfileTab(tab.id as any)}
                  className={`flex-1 py-3.5 px-4 text-sm font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
                    staffProfileTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {profileLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading staff information...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: PROFILE */}
                  {staffProfileTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Profile Picture & Name Section */}
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Profile Image */}
                        <div>
                          {selectedStaffProfile.user?.profile_image_url ? (
                            <img 
                              src={selectedStaffProfile.user.profile_image_url} 
                              alt={selectedStaffProfile.user?.full_name || 'Staff'} 
                              className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-xl"
                            />
                          ) : (
                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700 font-bold text-6xl flex items-center justify-center border-4 border-blue-200 shadow-xl">
                              {(selectedStaffProfile.user?.full_name || 'S').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Name and Basic Info */}
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedStaffProfile.user?.full_name || 'Staff Member'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedStaffProfile.designation || 'Staff'} • {selectedStaffProfile.department || 'N/A'}
                          </p>
                          
                          {/* Contact Pills */}
                          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-xs font-semibold text-blue-700">
                              <span>📱</span>
                              {selectedStaffProfile.user?.mobile || 'N/A'}
                            </div>
                            {selectedStaffProfile.user?.email && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-xs font-semibold text-green-700">
                                <span>✉️</span>
                                {selectedStaffProfile.user?.email}
                              </div>
                            )}
                            {selectedStaffProfile.class_assignments && selectedStaffProfile.class_assignments.length > 0 && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full text-xs font-semibold text-purple-700">
                                <span>📚</span>
                                {selectedStaffProfile.class_assignments.length} Class{selectedStaffProfile.class_assignments.length > 1 ? 'es' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Information Grid - Same style as student profile */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact Information Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                          <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs">📞</span>
                            Contact Information
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                              <span className="text-gray-600 font-medium">Mobile</span>
                              <span className="font-bold text-gray-900">{selectedStaffProfile.user?.mobile || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                              <span className="text-gray-600 font-medium">Email</span>
                              <span className="font-bold text-gray-900 text-xs break-all">{selectedStaffProfile.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">Staff ID</span>
                              <span className="font-mono font-bold text-gray-900 text-xs">{selectedStaffProfile.id?.slice(0, 8) || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Professional Summary Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5">
                          <h4 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-xs">💼</span>
                            Professional Details
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-purple-100">
                              <span className="text-gray-600 font-medium">Designation</span>
                              <span className="font-bold text-purple-700">{selectedStaffProfile.designation || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-purple-100">
                              <span className="text-gray-600 font-medium">Department</span>
                              <span className="font-bold text-gray-900">{selectedStaffProfile.department || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">Status</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                selectedStaffProfile.status === 'Active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {selectedStaffProfile.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Assigned Classes Card */}
                        <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-5">
                          <h4 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-xs">📚</span>
                            Assigned Classes
                          </h4>
                          <div className="space-y-2 text-xs">
                            {selectedStaffProfile.class_assignments && selectedStaffProfile.class_assignments.length > 0 ? (
                              selectedStaffProfile.class_assignments.map((assignment: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-green-200">
                                  <span className="font-bold text-green-700">{assignment.class}</span>
                                  <span className="text-gray-600">Section {assignment.section}</span>
                                </div>
                              ))
                            ) : selectedStaffProfile.assigned_class ? (
                              <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-green-200">
                                <span className="font-bold text-green-700">{selectedStaffProfile.assigned_class}</span>
                                <span className="text-gray-600">Section {selectedStaffProfile.assigned_section || 'A'}</span>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic text-center py-3">No classes assigned</p>
                            )}
                          </div>
                        </div>

                        {/* Joining & Salary Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-5">
                          <h4 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center text-xs">💰</span>
                            Employment Details
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-amber-100">
                              <span className="text-gray-600 font-medium">Joining Date</span>
                              <span className="font-bold text-gray-900">
                                {selectedStaffProfile.date_of_joining 
                                  ? new Date(selectedStaffProfile.date_of_joining).toLocaleDateString('en-IN')
                                  : 'N/A'}
                              </span>
                            </div>
                            {userRole === 6 && selectedStaffProfile.salary && (
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 font-medium">Monthly Salary</span>
                                <span className="font-bold text-green-600">₹{Number(selectedStaffProfile.salary).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ATTENDANCE */}
                  {staffProfileTab === 'attendance' && (
                    <div className="space-y-6">
                      {/* Attendance Stats Summary */}
                      {staffAttendanceStats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                            <p className="text-xs font-semibold text-purple-600">Total Days</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">{staffAttendanceStats.totalDays || 0}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                            <p className="text-xs font-semibold text-emerald-600">Present</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">{staffAttendanceStats.present || 0}</p>
                          </div>
                          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-center">
                            <p className="text-xs font-semibold text-rose-600">Absent</p>
                            <p className="text-2xl font-bold text-rose-700 mt-1">{staffAttendanceStats.absent || 0}</p>
                          </div>
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                            <p className="text-xs font-semibold text-amber-600">Leave</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">{staffAttendanceStats.leave || 0}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                            <p className="text-xs font-semibold text-blue-600">Percentage</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{staffAttendanceStats.percentage || 0}%</p>
                          </div>
                        </div>
                      )}

                      {/* Recent Attendance Logs */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Attendance Records</h4>
                        {staffAttendanceLogs.length === 0 ? (
                          <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">
                            No attendance records found for this staff member.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {staffAttendanceLogs.slice(0, 10).map((log: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                <span className="font-semibold text-gray-700">
                                  📅 {new Date(log.date).toLocaleDateString('en-IN', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric',
                                    weekday: 'short'
                                  })}
                                </span>
                                <span className={`font-bold px-3 py-1 rounded-full ${
                                  log.status === 'Present' 
                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                    : log.status === 'Absent'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PROFESSIONAL INFO */}
                  {staffProfileTab === 'professional' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Employment Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6">
                          <h4 className="text-base font-bold text-blue-900 mb-5 flex items-center gap-2">
                            <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">💼</span>
                            Employment Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <span className="text-gray-600 font-medium block">Designation</span>
                              <span className="font-bold text-gray-900 text-base">{selectedStaffProfile.designation || 'N/A'}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-600 font-medium block">Department</span>
                              <span className="font-bold text-gray-900 text-base">{selectedStaffProfile.department || 'N/A'}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-600 font-medium block">Date of Joining</span>
                              <span className="font-bold text-gray-900 text-base">
                                {selectedStaffProfile.date_of_joining 
                                  ? new Date(selectedStaffProfile.date_of_joining).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-600 font-medium block">Employment Status</span>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                selectedStaffProfile.status === 'Active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {selectedStaffProfile.status || 'Active'}
                              </span>
                            </div>
                            {userRole === 6 && selectedStaffProfile.salary && (
                              <div className="space-y-1 col-span-2">
                                <span className="text-gray-600 font-medium block">Monthly Salary</span>
                                <span className="font-bold text-green-600 text-xl">₹{Number(selectedStaffProfile.salary).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Class Assignments */}
                        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6">
                          <h4 className="text-base font-bold text-purple-900 mb-5 flex items-center gap-2">
                            <span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">📚</span>
                            Class Assignments
                          </h4>
                          {selectedStaffProfile.class_assignments && selectedStaffProfile.class_assignments.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedStaffProfile.class_assignments.map((assignment: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white rounded-xl border-2 border-purple-200 text-center">
                                  <div className="text-2xl font-bold text-purple-700">{assignment.class}</div>
                                  <div className="text-xs text-gray-600 mt-1">Section {assignment.section}</div>
                                </div>
                              ))}
                            </div>
                          ) : selectedStaffProfile.assigned_class ? (
                            <div className="p-4 bg-white rounded-xl border-2 border-purple-200 text-center max-w-xs">
                              <div className="text-2xl font-bold text-purple-700">{selectedStaffProfile.assigned_class}</div>
                              <div className="text-xs text-gray-600 mt-1">Section {selectedStaffProfile.assigned_section || 'A'}</div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-center py-8 bg-white rounded-xl">
                              No classes assigned to this staff member
                            </p>
                          )}
                        </div>

                        {/* Contact & Personal Details */}
                        <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-6">
                          <h4 className="text-base font-bold text-green-900 mb-5 flex items-center gap-2">
                            <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">📞</span>
                            Contact Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <span className="text-gray-600 font-medium block">Mobile Number</span>
                              <span className="font-bold text-gray-900 text-base">{selectedStaffProfile.user?.mobile || 'N/A'}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-gray-600 font-medium block">Email Address</span>
                              <span className="font-bold text-gray-900 text-sm break-all">{selectedStaffProfile.user?.email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => setShowStaffProfileModal(false)}
                className="px-5 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-xl text-sm font-semibold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
