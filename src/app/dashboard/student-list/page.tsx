'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { studentsApi, configApi, staffApi } from '@/lib/api'

export default function StudentListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [sections, setSections] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSection, setSelectedSection] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  
  // Teacher's assigned class/section
  const [teacherAssignedClass, setTeacherAssignedClass] = useState<string | null>(null)
  const [teacherAssignedSection, setTeacherAssignedSection] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    class: '',
    section: '',
    rollNo: '',
    teacherId: '',
    dob: '',
    age: '',
    gender: '',
    bloodGroup: '',
    aadharNumber: '',
    admissionDate: '',
    parentName: '',
    motherName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: ''
  })

  // Admit Student Modal states
  const [showAdmitModal, setShowAdmitModal] = useState(false)
  const [admitLoading, setAdmitLoading] = useState(false)
  const [admitMessage, setAdmitMessage] = useState<{ type: 'success' | 'error', text: string, credentials?: any } | null>(null)
  const [admitFormData, setAdmitFormData] = useState({
    studentName: '',
    dob: '',
    age: '',
    admissionDate: new Date().toISOString().split('T')[0],
    aadharNumber: '',
    gender: 'Male',
    studentClass: 'Nursery',
    section: 'A',
    rollNo: '',
    bloodGroup: '',
    parentName: '',
    motherName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    teacherId: ''
  })
  const [bloodGroups] = useState(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { 
      router.push('/login')
      return 
    }
    const roleNum = Number(role)
    setUserRole(roleNum)
    
    // Admin (role 6), Teacher (role 7), and Staff (role 8) can access
    if (![6, 7, 8].includes(roleNum)) {
      router.push('/dashboard')
      return
    }
    
    fetchStudents()
    fetchTeachers()
    fetchClasses()
    fetchSections()

    if (roleNum !== 6) {
      fetchTeacherProfile()
    }
  }, []) // Empty dependency array - runs only once

  const fetchTeacherProfile = async () => {
    try {
      const mobile = localStorage.getItem('userMobile')
      const res = await staffApi.list() as { success: boolean; data?: any[] }
      if (res.success && res.data) {
        const myStaff = res.data.find((s: any) => s.user?.mobile === mobile)
        if (myStaff) {
          const assignedClass = myStaff.assigned_class || null
          const assignedSection = myStaff.assigned_section || null
          
          console.log('👨‍🏫 Teacher assigned to:', { class: assignedClass, section: assignedSection })
          
          // Store teacher's assigned class/section
          setTeacherAssignedClass(assignedClass)
          setTeacherAssignedSection(assignedSection)
          
          // Set filter to teacher's assigned class/section
          if (assignedClass) {
            setSelectedClass(assignedClass)
          }
          if (assignedSection) {
            setSelectedSection(assignedSection)
          }
          
          setAdmitFormData(prev => ({
            ...prev,
            studentClass: assignedClass || prev.studentClass,
            section: assignedSection || prev.section,
            teacherId: myStaff.user_id || prev.teacherId
          }))
        } else {
          console.warn('⚠️ Teacher profile not found - teacher cannot manage any students')
        }
      }
    } catch (err) {
      console.error('Error fetching teacher profile:', err)
    }
  }

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
    window.addEventListener('studentUpdated', handleUpdate)
    
    // Method 2: BroadcastChannel API (works across tabs)
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('student_updates')
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'STUDENT_ADMITTED' || event.data.type === 'STUDENT_DELETED' || event.data.type === 'STUDENT_UPDATED') {
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
      window.removeEventListener('studentUpdated', handleUpdate)
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
      console.log('🔄 Fetching students from backend API...')
      
      const result = await studentsApi.list()
      
      console.log('📊 Students API response:', { 
        success: result.success, 
        count: result.data?.students?.length
      })
      
      if (result.success) {
        setStudents(result.data?.students || [])
        console.log('✅ Students updated in state:', result.data?.students?.length || 0)
        setMessage('') // Clear any previous messages
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
      const result = await studentsApi.getTeachers()
      if (result.success) {
        setTeachers(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    }
  }

  const fetchClasses = async () => {
    try {
      const result = await configApi.getClasses()
      if (result.success) {
        setClasses(['All', ...(result.data || [])])
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
      setClasses(['All', 'Nursery', 'LKG', 'UKG']) // Fallback
    }
  }

  const fetchSections = async () => {
    try {
      const result = await configApi.getSections()
      if (result.success && result.data) {
        // Always ensure "All" is the first option
        setSections(['All', ...result.data])
      } else {
        setSections(['All', 'A', 'B', 'C']) // Fallback with "All"
      }
    } catch (err) {
      console.error('Error fetching sections:', err)
      setSections(['All', 'A', 'B', 'C']) // Fallback with "All"
    }
  }

  const handleEdit = (student: any) => {
    setSelectedStudent(student)
    setFormData({
      fullName: student.user?.full_name || '',
      mobile: student.user?.mobile || '',
      email: student.user?.email || '',
      class: student.class || '',
      section: student.section || '',
      rollNo: student.roll_no ? String(student.roll_no) : '',
      teacherId: student.teacher_id || '',
      dob: student.dob || '',
      age: student.age ? String(student.age) : '',
      gender: student.gender || '',
      bloodGroup: student.blood_group || '',
      aadharNumber: student.aadhar_number || '',
      admissionDate: student.admission_date || '',
      parentName: student.parent_name || '',
      motherName: student.mother_name || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      pincode: student.pincode || '',
      emergencyContact: student.emergency_contact || ''
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
      
      const result = await studentsApi.delete(selectedStudent.id)

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

  const calculateAge = (dob: string): string => {
    if (!dob) return ''
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age.toString()
  }

  const handleAdmitDobChange = (dob: string) => {
    const age = calculateAge(dob)
    setAdmitFormData(prev => ({ ...prev, dob, age }))
  }

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdmitLoading(true)
    setAdmitMessage(null)

    try {
      const result = await studentsApi.admit(admitFormData)
      if (result.success) {
        setAdmitMessage({
          type: 'success',
          text: 'Student admitted successfully! Parent login account created automatically.',
          credentials: result.data?.credentials
        })
        fetchStudents()
      } else {
        setAdmitMessage({ type: 'error', text: result.error || 'Failed to admit student' })
      }
    } catch (error) {
      console.error('Admit student error:', error)
      setAdmitMessage({ type: 'error', text: 'Failed to admit student. Please try again.' })
    } finally {
      setAdmitLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setSaving(true)
    setMessage('')

    try {
      console.log('🔄 Updating student with data:', formData)
      
      const result = await studentsApi.update(selectedStudent.id, {
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        class: formData.class,
        section: formData.section,
        rollNo: formData.rollNo,
        teacherId: formData.teacherId,
        dob: formData.dob,
        age: formData.age,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        aadharNumber: formData.aadharNumber,
        admissionDate: formData.admissionDate,
        parentName: formData.parentName,
        motherName: formData.motherName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        emergencyContact: formData.emergencyContact
      })

      console.log('📝 Update response:', result)

      if (result.success) {
        setMessage('✅ Student updated successfully!')
        
        // Immediately refresh the student list to show updated data
        console.log('🔄 Refreshing student list...')
        await fetchStudents()
        
        // Send update signals for real-time updates
        window.dispatchEvent(new CustomEvent('studentUpdated', { 
          detail: { 
            updatedStudent: result.data,
            rollNo: formData.rollNo 
          } 
        }))
        
        // BroadcastChannel for cross-tab updates
        try {
          const channel = new BroadcastChannel('student_updates')
          channel.postMessage({ 
            type: 'STUDENT_UPDATED', 
            timestamp: Date.now(),
            studentId: selectedStudent.id,
            newRollNo: formData.rollNo
          })
          channel.close()
        } catch (e) {
          console.log('BroadcastChannel not supported')
        }
        
        console.log('✅ Student list refreshed and signals sent')
        
        setTimeout(() => {
          setShowModal(false)
          setMessage('')
        }, 1500)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Update error:', error)
      setMessage('❌ Failed to update student. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Filter by both class and section - for teachers, only show their assigned class
  const filtered = students.filter(s => {
    // For teachers (role 7), strictly enforce their assigned class/section
    if (userRole === 7) {
      // If teacher has no assigned class, they see nothing
      if (!teacherAssignedClass) {
        return false
      }
      
      // Teacher must see only their assigned class and section
      const classMatch = s.class === teacherAssignedClass
      const sectionMatch = !teacherAssignedSection || s.section === teacherAssignedSection
      
      return classMatch && sectionMatch
    }
    
    // For admin/principal (role 6 or 8), apply selected filters
    const classMatch = selectedClass === 'All' || s.class === selectedClass
    const sectionMatch = selectedSection === 'All' || s.section === selectedSection
    return classMatch && sectionMatch
  })

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Student List</h1>

      {message && (
        <div className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border text-xs sm:text-sm ${
          message.includes('Error:') || message.includes('Failed') 
            ? 'bg-red-50 text-red-800 border-red-200' 
            : message.includes('⚠️')
            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {message}
          {message.includes('Service role key') && (
            <div className="mt-2 text-xs sm:text-sm">
              <p>The app will work with limited functionality until the service role key is configured.</p>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">All Students</h3>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{filtered.length}</span>
              </div>
              
              {/* Show teacher's assigned class info */}
              {userRole === 7 && (
                <div className="bg-blue-50 border border-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg w-full sm:w-auto">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900">
                    {teacherAssignedClass ? (
                      <>Your Class: {teacherAssignedClass} {teacherAssignedSection ? `- ${teacherAssignedSection}` : ''}</>
                    ) : (
                      <span className="text-red-600">⚠️ No class assigned</span>
                    )}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap">
              {/* Class filter - only for admin/principal */}
              {userRole !== 7 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Class:</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm touch-manipulation"
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section filter - only for admin/principal */}
              {userRole !== 7 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Section:</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm touch-manipulation"
                  >
                    {sections.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Admit button - only show if teacher has assigned class OR if admin */}
              {(userRole === 6 || userRole === 8 || (userRole === 7 && teacherAssignedClass)) && (
                <button
                  onClick={() => {
                    setAdmitMessage(null)
                    setShowAdmitModal(true)
                  }}
                  className="bg-blue-50 text-blue-700 border-2 border-blue-400 font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-100 transition flex items-center justify-center gap-1.5 touch-manipulation whitespace-nowrap"
                >
                  <span>+ Admit New Student</span>
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Roll No</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Mobile</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Class</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Section</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Teacher</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 sm:px-4 md:px-6 py-8 sm:py-10 text-center text-xs sm:text-sm text-gray-500">
                      {userRole === 7 && !teacherAssignedClass ? (
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">⚠️</div>
                          <p className="text-base sm:text-lg font-semibold text-gray-700">No Class Assigned</p>
                          <p className="text-gray-600 mt-2 text-xs sm:text-sm">You have not been assigned to any class yet.</p>
                          <p className="text-gray-500 text-xs mt-1">Please contact the principal to assign you to a class.</p>
                        </div>
                      ) : (
                        <>
                          No students found
                          {selectedClass !== 'All' && ` for ${selectedClass}`}
                          {selectedSection !== 'All' && ` - Section ${selectedSection}`}
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{student.roll_no || 'N/A'}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap">{student.user?.full_name || 'N/A'}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{student.user?.mobile || 'N/A'}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{student.class || 'N/A'}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{student.section || 'N/A'}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {student.teacher?.full_name ? (
                          <div>
                            <div className="font-medium text-gray-900">{student.teacher.full_name}</div>
                            {student.teacher.assigned_class || student.teacher.assignedClass ? (
                              <div className="text-[10px] sm:text-xs text-blue-600 font-semibold mt-0.5">
                                {student.teacher.assigned_class || student.teacher.assignedClass} - {student.teacher.assigned_section || student.teacher.assignedSection || 'A'}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                          <button 
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors touch-manipulation"
                          >
                            Edit
                          </button>
                          {userRole === 6 && ( // Only admin (role 6) can delete
                            <button 
                              onClick={() => handleDelete(student)}
                              className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors touch-manipulation"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal with Full Details */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Edit Student Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => {
                      const age = calculateAge(e.target.value)
                      setFormData({ ...formData, dob: e.target.value, age })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (Auto-calculated)</label>
                  <input
                    type="text"
                    value={formData.age ? `${formData.age} years` : ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    placeholder="Auto-calculated from DOB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    pattern="[0-9]{12}"
                    maxLength={12}
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="12-digit Aadhar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Section</option>
                    {sections.filter(s => s !== 'All').map((section) => (
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Full Address"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-400 rounded-lg hover:bg-blue-100 disabled:opacity-50 font-medium text-sm"
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
                  className="px-4 py-2 bg-red-50 text-red-700 border-2 border-red-400 rounded-lg hover:bg-red-100 disabled:opacity-50 font-medium"
                >
                  {deleting ? 'Deleting...' : 'Delete Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admit Student Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">Admit New Student</h3>
              <button
                onClick={() => setShowAdmitModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAdmitSubmit} className="p-6">
              {admitMessage && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  admitMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <p className="font-semibold">{admitMessage.text}</p>
                  {admitMessage.credentials && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-300">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Parent Login Credentials Generated:</p>
                      <p className="text-sm text-gray-700">Mobile (Username): <span className="font-mono font-bold text-blue-600">{admitMessage.credentials.mobile}</span></p>
                      <p className="text-sm text-gray-700">Password: <span className="font-mono font-bold text-green-600">{admitMessage.credentials.password}</span></p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={admitFormData.studentName}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={admitFormData.dob}
                    onChange={(e) => handleAdmitDobChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (Auto-calculated)</label>
                  <input
                    type="text"
                    readOnly
                    value={admitFormData.age ? `${admitFormData.age} years` : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    placeholder="Auto-calculated from DOB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                  <input
                    type="date"
                    required
                    value={admitFormData.admissionDate}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    pattern="[0-9]{12}"
                    maxLength={12}
                    value={admitFormData.aadharNumber}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, aadharNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="12-digit Aadhar (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    required
                    value={admitFormData.gender}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={admitFormData.bloodGroup}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class * {userRole !== 6 && <span className="text-xs text-blue-600 font-normal">(🔒 Pre-filled for your class)</span>}
                  </label>
                  {userRole === 6 ? (
                    <select
                      required
                      value={admitFormData.studentClass}
                      onChange={(e) => setAdmitFormData({ ...admitFormData, studentClass: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {classes.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={admitFormData.studentClass || 'Nursery'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 font-semibold cursor-not-allowed text-gray-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section * {userRole !== 6 && <span className="text-xs text-blue-600 font-normal">(🔒 Pre-filled for your section)</span>}
                  </label>
                  {userRole === 6 ? (
                    <select
                      required
                      value={admitFormData.section}
                      onChange={(e) => setAdmitFormData({ ...admitFormData, section: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {sections.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={admitFormData.section || 'A'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 font-semibold cursor-not-allowed text-gray-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="number"
                    min="1"
                    value={admitFormData.rollNo}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., 1"
                  />
                </div>

                {userRole === 6 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher *</label>
                    <select
                      required
                      value={admitFormData.teacherId}
                      onChange={(e) => setAdmitFormData({ ...admitFormData, teacherId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    value={admitFormData.parentName}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Father's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name *</label>
                  <input
                    type="text"
                    required
                    value={admitFormData.motherName}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Mother's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number * (Login ID)</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={admitFormData.mobile}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="10-digit mobile number"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be used as login ID</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    value={admitFormData.emergencyContact}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Alternate mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={admitFormData.email}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="student@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={admitFormData.address}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="House/Flat No., Street, Area"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={admitFormData.city}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={admitFormData.state}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={admitFormData.pincode}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Default password will be <span className="font-mono font-bold">default123</span>. 
                  The mobile number will be used as the login ID.
                </p>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  disabled={admitLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={admitLoading}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-400 rounded-lg hover:bg-blue-100 text-sm font-medium disabled:opacity-50"
                >
                  {admitLoading ? 'Admitting...' : 'Admit Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
