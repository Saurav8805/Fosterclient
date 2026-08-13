'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { configApi, studentsApi, staffApi, attendanceApi, behaviourApi, progressApi } from '@/lib/api'

interface ClassStats {
  name: string
  studentCount: number
  sections: string[]
  teachers: string[]
}

interface StudentItem {
  id: string
  student_name?: string
  class?: string
  section?: string
  roll_no?: number
  mobile?: string
  email?: string
  dob?: string
  age?: number
  gender?: string
  blood_group?: string
  admission_date?: string
  aadhar_number?: string
  parent_name?: string
  mother_name?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  emergency_contact?: string
  user?: {
    full_name?: string
    mobile?: string
  }
  teacher?: {
    id?: string
    full_name?: string
  }
}

export default function ClassListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  
  // Navigation / View State
  const [viewMode, setViewMode] = useState<'classList' | 'studentList'>('classList')
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  
  // Level 1: Classes state
  const [classes, setClasses] = useState<ClassStats[]>([])
  const [teachersList, setTeachersList] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Level 2: Student List state
  const [students, setStudents] = useState<StudentItem[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [attendanceSummaryMap, setAttendanceSummaryMap] = useState<{ [studentId: string]: { todayStatus: string; overallPercentage: number; totalDays: number; present: number; absent: number; leave: number } }>({})

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [showEditClassModal, setShowEditClassModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  
  // Edit Class State
  const [editingClass, setEditingClass] = useState<ClassStats | null>(null)
  const [editClassName, setEditClassName] = useState('')
  const [editClassSection, setEditClassSection] = useState('A')
  const [editClassTeacherId, setEditClassTeacherId] = useState('')
  const [editClassSubmitting, setEditClassSubmitting] = useState(false)

  // Selected Student 360 View state
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)
  const [detailTab, setDetailTab] = useState<'attendance' | 'behaviour' | 'personal' | 'academics'>('attendance')
  const [studentAttendanceLogs, setStudentAttendanceLogs] = useState<any[]>([])
  const [studentBehaviourLogs, setStudentBehaviourLogs] = useState<any[]>([])
  const [studentProgressLogs, setStudentProgressLogs] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Edit Student state
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null)
  const [editStudentForm, setEditStudentForm] = useState<any>({})
  const [editStudentSubmitting, setEditStudentSubmitting] = useState(false)
  const [editStudentMessage, setEditStudentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add Class Form State
  const [newClassName, setNewClassName] = useState('')
  const [newClassSection, setNewClassSection] = useState('A')
  const [newClassTeacherId, setNewClassTeacherId] = useState('')
  const [addClassSubmitting, setAddClassSubmitting] = useState(false)

  // Comprehensive Add Student Form State
  const [admitFormData, setAdmitFormData] = useState({
    studentName: '',
    dob: '',
    age: '',
    admissionDate: new Date().toISOString().split('T')[0],
    aadharNumber: '',
    gender: 'Male',
    section: 'A',
    rollNo: '',
    bloodGroup: 'O+',
    parentName: '',
    motherName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    teacherId: '',
    totalFees: ''
  })
  const [admitSubmitting, setAdmitSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/login')
      return
    }
    setUserRole(Number(role))
    fetchClassStats()
    fetchTeachers()
  }, [])

  const fetchClassStats = async () => {
    try {
      setLoadingClasses(true)
      setError(null)
      const result = await configApi.getClassStats()
      
      if (result.success) {
        setClasses(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch class statistics')
      }
    } catch (err: any) {
      console.error('Failed to fetch class stats:', err)
      setError(err.message || 'Failed to fetch class statistics')
    } finally {
      setLoadingClasses(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const res = await staffApi.list()
      if (res.success && Array.isArray(res.data)) {
        setTeachersList(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err)
    }
  }

  // Handle Level 1 -> Level 2: Click Class Card
  const handleOpenClass = async (className: string) => {
    setSelectedClass(className)
    setViewMode('studentList')
    await fetchStudentsForClass(className)
  }

  // Fetch Students & Calculate Live Attendance Badges & Overall %
  const fetchStudentsForClass = async (className: string) => {
    try {
      setLoadingStudents(true)
      const [studentsRes, attendanceRes] = await Promise.all([
        studentsApi.list(),
        attendanceApi.getStudentAttendance({})
      ])

      let classStudents: StudentItem[] = []
      if (studentsRes.success && Array.isArray(studentsRes.data?.students)) {
        const targetClean = className.trim().toLowerCase()
        classStudents = studentsRes.data.students.filter((s: any) => 
          s.class && String(s.class).trim().toLowerCase() === targetClean
        )
      }
      setStudents(classStudents)

      // Calculate Attendance Map for each student
      const allAttendance = attendanceRes.success ? (attendanceRes.data?.attendance || []) : []
      const todayStr = new Date().toISOString().split('T')[0]
      const summaryMap: { [studentId: string]: any } = {}

      classStudents.forEach(student => {
        const studentRecords = allAttendance.filter((a: any) => a.student_id === student.id)
        const totalDays = studentRecords.length
        const present = studentRecords.filter((a: any) => a.status === 'Present').length
        const absent = studentRecords.filter((a: any) => a.status === 'Absent').length
        const leave = studentRecords.filter((a: any) => a.status === 'Leave').length
        const overallPercentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

        // Find today's status
        const todayRecord = studentRecords.find((a: any) => a.date?.startsWith(todayStr))
        const todayStatus = todayRecord ? todayRecord.status : 'Not Marked'

        summaryMap[student.id] = {
          todayStatus,
          overallPercentage,
          totalDays,
          present,
          absent,
          leave
        }
      })

      setAttendanceSummaryMap(summaryMap)
    } catch (err: any) {
      console.error('Failed to fetch class students:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Handle Level 2 -> Level 3: Click Student Row for 360° Profile
  const handleOpenStudentDetail = async (student: StudentItem) => {
    setSelectedStudent(student)
    setDetailTab('attendance')
    setShowStudentDetailModal(true)
    setDetailLoading(true)

    try {
      const [attRes, behRes, progRes] = await Promise.all([
        attendanceApi.getStudentAttendance({ studentId: student.id }),
        behaviourApi.list(),
        progressApi.getStudentProgress(student.id)
      ])

      if (attRes.success) {
        setStudentAttendanceLogs(attRes.data?.attendance || [])
      } else {
        setStudentAttendanceLogs([])
      }

      if (behRes.success && Array.isArray(behRes.data)) {
        // The behaviour API returns nested student data: { student: { id, ... } }
        const filtered = behRes.data.filter((b: any) => {
          // Check both student_id (direct) and student.id (nested)
          return b.student_id === student.id || b.student?.id === student.id;
        });
        console.log(`📊 Found ${filtered.length} behaviour records for student ${student.student_name}`);
        setStudentBehaviourLogs(filtered);
      } else {
        console.log('⚠️ No behaviour data received');
        setStudentBehaviourLogs([]);
      }

      if (progRes.success) {
        setStudentProgressLogs(progRes.data?.progress || (Array.isArray(progRes.data) ? progRes.data : []))
      } else {
        setStudentProgressLogs([])
      }
    } catch (err) {
      console.error('Failed to load student full profile:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  // Open Edit Class Modal
  const handleOpenEditClass = (cls: ClassStats, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingClass(cls)
    setEditClassName(cls.name)
    setEditClassSection(cls.sections[0] || 'A')
    const foundTeacher = teachersList.find(t => cls.teachers.includes(t.user?.full_name || t.full_name))
    setEditClassTeacherId(foundTeacher?.user_id || foundTeacher?.id || '')
    setShowEditClassModal(true)
  }

  // Form Submit: Edit Class
  const handleEditClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClass || !editClassName.trim()) return

    try {
      setEditClassSubmitting(true)
      const res = await configApi.updateClass({
        oldClassName: editingClass.name,
        newClassName: editClassName.trim(),
        section: editClassSection,
        teacherId: editClassTeacherId
      })

      if (res.success) {
        setActionMessage({ type: 'success', text: `Class ${editingClass.name} updated successfully!` })
        setShowEditClassModal(false)
        await fetchClassStats()
        setTimeout(() => setActionMessage(null), 4000)
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Failed to update class' })
      }
    } catch (err: any) {
      console.error('Edit class error:', err)
      setActionMessage({ type: 'error', text: err.message || 'Failed to update class' })
    } finally {
      setEditClassSubmitting(false)
    }
  }

  // Form Submit: Add Class
  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassName.trim()) return

    try {
      setAddClassSubmitting(true)
      const existing = classes.find(c => c.name.toLowerCase() === newClassName.trim().toLowerCase())
      if (!existing) {
        const teacherObj = teachersList.find(t => t.user_id === newClassTeacherId || t.id === newClassTeacherId)
        const teacherName = teacherObj?.user?.full_name || teacherObj?.full_name || ''

        const newClassCard: ClassStats = {
          name: newClassName.trim(),
          studentCount: 0,
          sections: [newClassSection],
          teachers: teacherName ? [teacherName] : []
        }
        setClasses(prev => [...prev, newClassCard])
      }
      setShowAddClassModal(false)
      setNewClassName('')
      setNewClassTeacherId('')
      setActionMessage({ type: 'success', text: `Class ${newClassName} added successfully!` })
      setTimeout(() => setActionMessage(null), 4000)
    } catch (err: any) {
      console.error('Failed to add class:', err)
    } finally {
      setAddClassSubmitting(false)
    }
  }

  // Form Submit: Admit Student into selected class
  const handleAdmitStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admitFormData.studentName.trim() || !selectedClass) return

    try {
      setAdmitSubmitting(true)
      setActionMessage(null)

      const targetSection = admitFormData.section || 'A'
      const payload = {
        ...admitFormData,
        studentClass: selectedClass,
        section: targetSection
      }

      const res = await studentsApi.admit(payload)

      if (res.success) {
        setActionMessage({ type: 'success', text: `Student "${admitFormData.studentName}" admitted to Class ${selectedClass} (${targetSection})!` })
        setShowAddStudentModal(false)
        await fetchStudentsForClass(selectedClass)
        await fetchClassStats()
        setTimeout(() => setActionMessage(null), 4000)
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Failed to admit student' })
      }
    } catch (err: any) {
      console.error('Admit student error:', err)
      setActionMessage({ type: 'error', text: err.message || 'Failed to admit student' })
    } finally {
      setAdmitSubmitting(false)
    }
  }

  const getAttendanceBadgeClass = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Absent':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      case 'Leave':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  // Handle Edit Student Submit (Principal only)
  const handleEditStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    setEditStudentSubmitting(true)
    setEditStudentMessage(null)

    try {
      const payload = {
        studentId: editingStudent.id,
        studentName: editStudentForm.studentName,
        dob: editStudentForm.dob,
        age: editStudentForm.age,
        gender: editStudentForm.gender,
        parentName: editStudentForm.parentName,
        motherName: editStudentForm.motherName,
        mobile: editStudentForm.mobile,
        email: editStudentForm.email,
        address: editStudentForm.address,
        city: editStudentForm.city,
        state: editStudentForm.state,
        pincode: editStudentForm.pincode,
        bloodGroup: editStudentForm.bloodGroup,
        aadharNumber: editStudentForm.aadharNumber,
        rollNo: editStudentForm.rollNo,
        section: editStudentForm.section,
        emergencyContact: editStudentForm.emergencyContact,
      }

      const res = await studentsApi.update(editingStudent.id, {
        student_name: editStudentForm.studentName,
        dob: editStudentForm.dob || null,
        age: editStudentForm.age ? Number(editStudentForm.age) : null,
        gender: editStudentForm.gender || null,
        parent_name: editStudentForm.parentName || null,
        mother_name: editStudentForm.motherName || null,
        mobile: editStudentForm.mobile || null,
        email: editStudentForm.email || null,
        address: editStudentForm.address || null,
        city: editStudentForm.city || null,
        state: editStudentForm.state || null,
        pincode: editStudentForm.pincode || null,
        blood_group: editStudentForm.bloodGroup || null,
        aadhar_number: editStudentForm.aadharNumber || null,
        roll_no: editStudentForm.rollNo ? Number(editStudentForm.rollNo) : null,
        section: editStudentForm.section || null,
        emergency_contact: editStudentForm.emergencyContact || null,
      })

      if (res.success) {
        setEditStudentMessage({ type: 'success', text: 'Student details updated successfully!' })
        setShowEditStudentModal(false)
        if (selectedClass) await fetchStudentsForClass(selectedClass)
        setTimeout(() => setEditStudentMessage(null), 4000)
      } else {
        setEditStudentMessage({ type: 'error', text: res.error || 'Failed to update student details' })
      }
    } catch (err: any) {
      setEditStudentMessage({ type: 'error', text: err.message || 'Failed to update student details' })
    } finally {
      setEditStudentSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Bar */}
      <div className="bg-white border-b px-6 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <span
                onClick={() => setViewMode('classList')}
                className="hover:text-[#5e3a9e] cursor-pointer transition flex items-center gap-1"
              >
                🏫 Class List
              </span>
              {viewMode === 'studentList' && selectedClass && (
                <>
                  <span>/</span>
                  <span className="text-[#5e3a9e]">Class {selectedClass}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'classList' ? 'Class Management' : `Students - Class ${selectedClass}`}
            </h1>
          </div>

          {/* Action Buttons based on current view */}
          <div className="flex items-center gap-3">
            {viewMode === 'studentList' && (
              <button
                onClick={() => setViewMode('classList')}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
              >
                ← Back to Classes
              </button>
            )}

            {viewMode === 'classList' ? (
              <button
                onClick={() => setShowAddClassModal(true)}
                className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a2d7e] transition flex items-center gap-2 text-sm font-medium shadow-md shadow-purple-100 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Class
              </button>
            ) : (
              <button
                onClick={() => {
                  setAdmitFormData(prev => ({ 
                    ...prev, 
                    studentName: '', 
                    mobile: '', 
                    rollNo: '', 
                    section: 'A',
                    dob: '',
                    parentName: '',
                    motherName: '',
                    email: '',
                    address: '',
                    emergencyContact: ''
                  }))
                  setShowAddStudentModal(true)
                }}
                className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a2d7e] transition flex items-center gap-2 text-sm font-medium shadow-md shadow-purple-100 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Student
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Banner Alert Message */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-sm transition ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{actionMessage.type === 'success' ? '✅' : '⚠️'}</span>
              <span className="text-sm font-medium">{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
              ✕
            </button>
          </div>
        )}

        {/* LEVEL 1: CLASS CARDS GRID */}
        {viewMode === 'classList' && (
          <>
            {loadingClasses ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-3"></div>
                <p className="text-gray-500 text-sm">Loading classes data...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
                <div className="w-16 h-16 bg-purple-50 text-[#5e3a9e] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🏫
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No Classes Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Add your first class to get started managing students and attendance.
                </p>
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4a2d7e] transition"
                >
                  Add First Class
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classes.map((cls, index) => (
                  <div
                    key={index}
                    onClick={() => handleOpenClass(cls.name)}
                    className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md hover:border-[#5e3a9e]/50 transition duration-200 cursor-pointer group flex flex-col justify-between relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5e3a9e] font-bold text-xl flex items-center justify-center group-hover:scale-105 transition">
                          {cls.name.charAt(0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-[#5e3a9e] rounded-full">
                            {cls.studentCount} Student{cls.studentCount === 1 ? '' : 's'}
                          </span>
                          <button
                            onClick={(e) => handleOpenEditClass(cls, e)}
                            title="Edit Class Details"
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#5e3a9e] transition text-sm"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5e3a9e] transition mb-3">
                        Class {cls.name}
                      </h3>
                      <div className="space-y-1.5 text-xs text-gray-600 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Sections:</span>
                          <span className="font-semibold text-gray-800">
                            {cls.sections.length > 0 ? cls.sections.join(', ') : 'A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Class Teacher:</span>
                          <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                            {cls.teachers.length > 0 ? cls.teachers.join(', ') : 'Not assigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#5e3a9e]">
                      <span>View Student Roster</span>
                      <span className="group-hover:translate-x-1 transition">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* LEVEL 2: STUDENT ROSTER FOR SELECTED CLASS */}
        {viewMode === 'studentList' && selectedClass && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Control Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Student Roster - Class {selectedClass}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing live today's attendance status & overall attendance performance
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 bg-[#5e3a9e]/10 text-[#5e3a9e] rounded-full border border-[#5e3a9e]/20">
                Total: {students.length} Student{students.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingStudents ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-3"></div>
                <p className="text-gray-500 text-sm">Loading student records...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  👨‍🎓
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No Students in Class {selectedClass}</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Admit your first student into Class {selectedClass} to populate the roster.
                </p>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-[#5e3a9e] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4a2d7e] transition"
                >
                  Add Student Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Roll No</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Section</th>
                      <th className="px-6 py-4">Today's Attendance</th>
                      <th className="px-6 py-4">Overall Attendance %</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {students.map(student => {
                      const name = student.student_name || student.user?.full_name || 'N/A'
                      const att = attendanceSummaryMap[student.id] || { todayStatus: 'Not Marked', overallPercentage: 0 }
                      const badgeClass = getAttendanceBadgeClass(att.todayStatus)

                      return (
                        <tr
                          key={student.id}
                          onClick={() => handleOpenStudentDetail(student)}
                          className="hover:bg-purple-50/40 transition cursor-pointer group"
                        >
                          <td className="px-6 py-4 font-mono font-semibold text-gray-600">
                            #{student.roll_no || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5e3a9e] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-[#5e3a9e] transition">
                                  {name}
                                </p>
                                <p className="text-xs text-gray-500">{student.parent_name ? `Parent: ${student.parent_name}` : 'Student'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                              Section {student.section || 'A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {att.todayStatus === 'Present' ? 'P - Present' : att.todayStatus === 'Absent' ? 'A - Absent' : att.todayStatus === 'Leave' ? 'L - Leave' : 'Not Marked'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    att.overallPercentage >= 85
                                      ? 'bg-emerald-500'
                                      : att.overallPercentage >= 75
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${att.overallPercentage}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-xs text-gray-800">{att.overallPercentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {userRole === 6 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingStudent(student)
                                    setEditStudentForm({
                                      studentName: student.student_name || '',
                                      dob: student.dob || '',
                                      age: student.age || '',
                                      gender: student.gender || 'Male',
                                      parentName: student.parent_name || '',
                                      motherName: student.mother_name || '',
                                      mobile: student.mobile || '',
                                      email: student.email || '',
                                      address: student.address || '',
                                      city: student.city || '',
                                      state: student.state || '',
                                      pincode: student.pincode || '',
                                      bloodGroup: student.blood_group || '',
                                      aadharNumber: student.aadhar_number || '',
                                      rollNo: student.roll_no || '',
                                      section: student.section || 'A',
                                      emergencyContact: student.emergency_contact || '',
                                    })
                                    setEditStudentMessage(null)
                                    setShowEditStudentModal(true)
                                  }}
                                  title="Edit Student Details"
                                  className="p-1.5 text-gray-400 hover:text-[#5e3a9e] hover:bg-purple-50 rounded-lg transition"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenStudentDetail(student)
                                }}
                                className="text-xs font-bold text-[#5e3a9e] hover:text-[#4a2d7e] px-3 py-1.5 rounded-lg hover:bg-purple-100/60 transition"
                              >
                                Full Profile →
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD CLASS */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span>🏫</span> Add New Class
              </h3>
              <button onClick={() => setShowAddClassModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddClassSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nursery, LKG, Class 1, Class 2..."
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Initial Section
                </label>
                <select
                  value={newClassSection}
                  onChange={e => setNewClassSection(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none bg-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assign Class Teacher
                </label>
                <select
                  value={newClassTeacherId}
                  onChange={e => setNewClassTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none bg-white text-xs"
                >
                  <option value="">-- Select Available Teacher --</option>
                  {teachersList.map((t: any) => (
                    <option key={t.id || t.user_id} value={t.user_id || t.id}>
                      {t.user?.full_name || t.full_name} ({t.designation || 'Teacher'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addClassSubmitting}
                  className="px-5 py-2 bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
                >
                  {addClassSubmitting ? 'Adding...' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.5: EDIT CLASS */}
      {showEditClassModal && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span>✏️</span> Edit Class Details
              </h3>
              <button onClick={() => setShowEditClassModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleEditClassSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={e => setEditClassName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={editClassSection}
                  onChange={e => setEditClassSection(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none bg-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assigned Class Teacher
                </label>
                <select
                  value={editClassTeacherId}
                  onChange={e => setEditClassTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none bg-white text-xs"
                >
                  <option value="">-- Select Class Teacher --</option>
                  {teachersList.map((t: any) => (
                    <option key={t.id || t.user_id} value={t.user_id || t.id}>
                      {t.user?.full_name || t.full_name} ({t.designation || 'Teacher'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editClassSubmitting}
                  className="px-5 py-2 bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
                >
                  {editClassSubmitting ? 'Updating...' : 'Update Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPREHENSIVE ADD STUDENT (LOCKED CLASS & SECTION) */}
      {showAddStudentModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <span>👨‍🎓</span> Admit Student to Class {selectedClass}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Comprehensive Student & Parent Registration Form</p>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdmitStudentSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* SECTION 1: ACADEMIC ASSIGNMENT (LOCKED CLASS & SECTION) */}
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5e3a9e] flex items-center gap-1.5">
                  <span>🏫</span> Academic Class Assignment (Locked)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Assigned Class 🔒
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`Class ${selectedClass}`}
                      className="w-full px-3.5 py-2 border border-purple-200 bg-purple-100/60 rounded-xl text-sm font-bold text-[#5e3a9e] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Section 🔒
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`Section ${admitFormData.section || 'A'}`}
                      className="w-full px-3.5 py-2 border border-purple-200 bg-purple-100/60 rounded-xl text-sm font-bold text-[#5e3a9e] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Roll No</label>
                    <input
                      type="number"
                      placeholder="e.g. 101"
                      value={admitFormData.rollNo}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, rollNo: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 bg-white rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: STUDENT PERSONAL DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-1">
                  👤 Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Student Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full name of student"
                      value={admitFormData.studentName}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, studentName: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                    <select
                      value={admitFormData.gender}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={admitFormData.dob}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Age (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 6"
                      value={admitFormData.age}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                    <select
                      value={admitFormData.bloodGroup}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      placeholder="12-digit Aadhar number"
                      value={admitFormData.aadharNumber}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Total Annual Fees (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 25000"
                      value={admitFormData.totalFees}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, totalFees: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none font-bold text-[#5e3a9e]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PARENT & GUARDIAN INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-1">
                  👪 Parent & Guardian Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Parent / Father Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Father's full name"
                      value={admitFormData.parentName}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, parentName: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mother Name</label>
                    <input
                      type="text"
                      placeholder="Mother's full name"
                      value={admitFormData.motherName}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Primary Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={admitFormData.mobile}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={admitFormData.email}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="tel"
                      placeholder="Emergency contact mobile"
                      value={admitFormData.emergencyContact}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={admitFormData.admissionDate}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, admissionDate: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ADDRESS DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-1">
                  🏠 Residential Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="House No, Colony, Landmark"
                      value={admitFormData.address}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={admitFormData.city}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={admitFormData.state}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="6-digit pincode"
                      value={admitFormData.pincode}
                      onChange={e => setAdmitFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={admitSubmitting}
                  className="px-6 py-2 bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {admitSubmitting ? 'Admitting Student...' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 360° STUDENT PROFILE (LEVEL 3) */}
      {showStudentDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl overflow-hidden my-6">
            {/* Profile Banner Header */}
            <div className="p-6 bg-gradient-to-r from-[#5e3a9e] to-purple-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  {(selectedStudent.student_name || selectedStudent.user?.full_name || 'S').charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedStudent.student_name || selectedStudent.user?.full_name || 'Student Profile'}
                  </h2>
                  <p className="text-xs text-purple-200 mt-1 flex items-center gap-2">
                    <span>Class: {selectedStudent.class}-{selectedStudent.section || 'A'}</span>
                    <span>•</span>
                    <span>Roll No: #{selectedStudent.roll_no || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentDetailModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Profile Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50/50">
              {[
                { id: 'attendance', label: '📊 Attendance' },
                { id: 'behaviour', label: '⭐ Behaviour' },
                { id: 'personal', label: '👤 Personal & Parent' },
                { id: 'academics', label: '🎓 Academic Marks' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  className={`flex-1 py-3.5 px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
                    detailTab === tab.id
                      ? 'border-[#5e3a9e] text-[#5e3a9e] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {detailLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading full student analytics...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: ATTENDANCE */}
                  {detailTab === 'attendance' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                          <p className="text-xs font-semibold text-purple-600">Overall Attendance</p>
                          <p className="text-2xl font-bold text-[#5e3a9e] mt-1">
                            {attendanceSummaryMap[selectedStudent.id]?.overallPercentage ?? 0}%
                          </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                          <p className="text-xs font-semibold text-emerald-600">Present Count</p>
                          <p className="text-2xl font-bold text-emerald-700 mt-1">
                            {attendanceSummaryMap[selectedStudent.id]?.present ?? 0}
                          </p>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-center">
                          <p className="text-xs font-semibold text-rose-600">Absent Count</p>
                          <p className="text-2xl font-bold text-rose-700 mt-1">
                            {attendanceSummaryMap[selectedStudent.id]?.absent ?? 0}
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                          <p className="text-xs font-semibold text-amber-600">Leave Count</p>
                          <p className="text-2xl font-bold text-amber-700 mt-1">
                            {attendanceSummaryMap[selectedStudent.id]?.leave ?? 0}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Attendance Logs</h4>
                        {studentAttendanceLogs.length === 0 ? (
                          <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">
                            No attendance history logged yet for this student.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {studentAttendanceLogs.slice(0, 8).map((log: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                <span className="font-semibold text-gray-700">
                                  📅 {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full border ${getAttendanceBadgeClass(log.status)}`}>
                                  {log.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BEHAVIOUR */}
                  {detailTab === 'behaviour' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Behaviour Incidents & Ratings</h4>
                        <button
                          onClick={async () => {
                            if (selectedStudent) {
                              setDetailLoading(true);
                              try {
                                const behRes = await behaviourApi.list();
                                if (behRes.success && Array.isArray(behRes.data)) {
                                  const filtered = behRes.data.filter((b: any) => {
                                    return b.student_id === selectedStudent.id || b.student?.id === selectedStudent.id;
                                  });
                                  console.log(`🔄 Refreshed: ${filtered.length} behaviour records`);
                                  setStudentBehaviourLogs(filtered);
                                }
                              } catch (err) {
                                console.error('Failed to refresh behaviour:', err);
                              } finally {
                                setDetailLoading(false);
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5e3a9e] bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                      </div>
                      {studentBehaviourLogs.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 italic">No behaviour records reported by teachers yet.</p>
                        </div>
                      ) : (
                        studentBehaviourLogs.map((beh: any, idx: number) => {
                          const behaviorType = beh.type || 'Neutral';
                          const bgColor = behaviorType === 'Positive' ? 'bg-emerald-100 text-emerald-800' : 
                                         behaviorType === 'Negative' ? 'bg-rose-100 text-rose-800' : 
                                         'bg-yellow-100 text-yellow-800';
                          
                          return (
                            <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-bold px-2.5 py-0.5 rounded-full ${bgColor}`}>
                                  {behaviorType}
                                </span>
                                <span className="text-gray-400">{beh.date ? new Date(beh.date).toLocaleDateString() : ''}</span>
                              </div>
                              <p className="text-xs font-semibold text-gray-800 pt-1">{beh.incident}</p>
                              {beh.action_taken && (
                                <p className="text-[11px] text-gray-500">Action: {beh.action_taken}</p>
                              )}
                              {beh.reported_by && (
                                <p className="text-[11px] text-gray-400 italic">Reported by: {beh.reported_by}</p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TAB 3: PERSONAL DETAILS */}
                  {detailTab === 'personal' && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <span className="text-gray-400 font-medium">Father / Parent Name</span>
                        <p className="font-bold text-gray-900">{selectedStudent.parent_name || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <span className="text-gray-400 font-medium">Mother Name</span>
                        <p className="font-bold text-gray-900">{selectedStudent.mother_name || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <span className="text-gray-400 font-medium">Primary Mobile</span>
                        <p className="font-bold text-gray-900">{selectedStudent.mobile || selectedStudent.user?.mobile || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <span className="text-gray-400 font-medium">Emergency Contact</span>
                        <p className="font-bold text-gray-900">{selectedStudent.emergency_contact || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <span className="text-gray-400 font-medium">Date of Birth</span>
                        <p className="font-bold text-gray-900">{selectedStudent.dob || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <span className="text-gray-400 font-medium">Blood Group</span>
                        <p className="font-bold text-gray-900">{selectedStudent.blood_group || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1 col-span-2">
                        <span className="text-gray-400 font-medium">Full Address</span>
                        <p className="font-bold text-gray-900">{selectedStudent.address ? `${selectedStudent.address}, ${selectedStudent.city || ''}` : 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ACADEMIC MARKS */}
                  {detailTab === 'academics' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900">Academic Progress & Exam Scores</h4>
                      {studentProgressLogs.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 italic">No academic marks entered yet for this student.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {studentProgressLogs.map((prog: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-gray-900">{prog.subject} ({prog.term || 'Term 1'})</p>
                                <p className="text-gray-500 text-[11px]">{prog.remarks || 'No remarks'}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-sm text-[#5e3a9e]">{prog.marks_obtained} / {prog.max_marks || 100}</span>
                                <p className="text-[11px] font-semibold text-emerald-600">Grade: {prog.grade || 'A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => setShowStudentDetailModal(false)}
                className="px-5 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-xl text-xs font-semibold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Edit Student Modal (Principal only) ── */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b bg-gradient-to-r from-[#5e3a9e] to-[#7c52c8] text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Edit Student Details</h2>
                <p className="text-xs text-purple-200 mt-0.5">
                  ✏️ {editingStudent.student_name || 'Student'} — Class {selectedClass}
                </p>
              </div>
              <button onClick={() => setShowEditStudentModal(false)} className="text-white/70 hover:text-white transition text-xl font-light">✕</button>
            </div>

            {/* Status Messages */}
            {editStudentMessage && (
              <div className={`mx-6 mt-4 p-3 rounded-xl text-sm font-medium ${editStudentMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {editStudentMessage.type === 'success' ? '✓ ' : '✗ '}{editStudentMessage.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEditStudentSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Section: Basic Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-purple-100 text-[#5e3a9e] rounded flex items-center justify-center text-[10px]">👤</span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input required value={editStudentForm.studentName || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, studentName: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="Student full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" value={editStudentForm.dob || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, dob: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Age</label>
                    <input type="number" value={editStudentForm.age || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, age: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="e.g. 8" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                    <select value={editStudentForm.gender || 'Male'} onChange={e => setEditStudentForm((p: any) => ({ ...p, gender: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none">
                      {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                    <select value={editStudentForm.bloodGroup || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, bloodGroup: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none">
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Roll No.</label>
                    <input type="number" value={editStudentForm.rollNo || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, rollNo: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="Roll number" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                    <select value={editStudentForm.section || 'A'} onChange={e => setEditStudentForm((p: any) => ({ ...p, section: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none">
                      {['A','B','C','D','E'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhar Number</label>
                    <input value={editStudentForm.aadharNumber || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, aadharNumber: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="12-digit Aadhar" />
                  </div>
                </div>
              </div>

              {/* Section: Contact & Family */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-[10px]">📞</span>
                  Contact & Family
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Father&apos;s Name</label>
                    <input value={editStudentForm.parentName || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, parentName: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="Father's full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mother&apos;s Name</label>
                    <input value={editStudentForm.motherName || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, motherName: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="Mother's full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                    <input value={editStudentForm.mobile || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, mobile: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="10-digit mobile" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={editStudentForm.email || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, email: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="parent@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact</label>
                    <input value={editStudentForm.emergencyContact || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, emergencyContact: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="Emergency contact number" />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-100 text-green-700 rounded flex items-center justify-center text-[10px]">📍</span>
                  Address
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                    <input value={editStudentForm.address || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, address: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="House/Flat, Street, Area" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                    <input value={editStudentForm.city || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, city: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                    <input value={editStudentForm.state || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, state: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="State" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                    <input value={editStudentForm.pincode || ''} onChange={e => setEditStudentForm((p: any) => ({ ...p, pincode: e.target.value }))} className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e]/30 outline-none" placeholder="6-digit pincode" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" onClick={() => setShowEditStudentModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={editStudentSubmitting} className="flex-1 py-2.5 bg-[#5e3a9e] text-white rounded-xl text-sm font-bold hover:bg-[#4a2d7e] transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {editStudentSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
