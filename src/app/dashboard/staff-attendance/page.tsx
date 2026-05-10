'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { staffApi } from '@/lib/api'
import * as XLSX from 'xlsx'

export default function StaffAttendancePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'mark' | 'view'>('mark')
  
  // Mark Attendance State
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: string }>({})
  const [saving, setSaving] = useState(false)
  const [submittedDates, setSubmittedDates] = useState<Set<string>>(new Set())
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isEditMode, setIsEditMode] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState<any[]>([])
  const [loadingExistingAttendance, setLoadingExistingAttendance] = useState(false)

  // View Attendance State
  const [overallStartDate, setOverallStartDate] = useState('')
  const [overallEndDate, setOverallEndDate] = useState('')
  const [overallData, setOverallData] = useState<any[]>([])
  const [overallLoading, setOverallLoading] = useState(false)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [startCalendarMonth, setStartCalendarMonth] = useState(new Date())
  const [endCalendarMonth, setEndCalendarMonth] = useState(new Date())
  
  // Detailed View State (when clicking on a staff member)
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<any>(null)
  const [detailedRecords, setDetailedRecords] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/login')
      return
    }
    const roleNum = Number(role)
    setUserRole(roleNum)
    fetchStaffList()
    fetchSubmittedDates()
  }, [router])

  useEffect(() => {
    // Fetch existing attendance when selectedDate changes and is not empty
    if (selectedDate && staffMembers.length > 0) {
      fetchExistingAttendance(selectedDate)
    }
  }, [selectedDate])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.calendar-container')) {
        setShowCalendar(false)
        setShowStartCalendar(false)
        setShowEndCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchSubmittedDates = async () => {
    try {
      // Fetch all attendance records to determine which dates have submissions
      const result = await staffApi.getAttendance({})
      if (result.success) {
        const dates = new Set<string>()
        result.data?.attendance?.forEach((record: any) => {
          // Ensure date format is consistent (YYYY-MM-DD)
          const dateStr = record.date.split('T')[0] // Remove time part if present
          dates.add(dateStr)
        })
        console.log('📅 Submitted dates:', Array.from(dates))
        setSubmittedDates(dates)
      }
    } catch (error) {
      console.error('Failed to fetch submitted dates:', error)
    }
  }

  const fetchStaffList = async () => {
    try {
      setLoading(true)
      const result = await staffApi.list()
      if (result.success) {
        setStaffMembers(result.data || [])
        // Initialize attendance data as empty - no default selection
        const initialData: { [key: string]: string } = {}
        setAttendanceData(initialData)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingAttendance = async (date: string) => {
    try {
      setLoadingExistingAttendance(true)
      setExistingAttendance([])
      setAttendanceData({})
      setIsEditMode(false)

      const result = await staffApi.getAttendance({ date })
      
      if (result.success && result.data?.attendance?.length > 0) {
        const records = result.data.attendance
        setExistingAttendance(records)
        
        // Populate attendance data from existing records
        const existingData: { [key: string]: string } = {}
        records.forEach((record: any) => {
          existingData[record.staff_id] = record.status
        })
        setAttendanceData(existingData)
        
        console.log('📋 Loaded existing attendance:', records.length, 'records')
      } else {
        // No existing attendance for this date
        setExistingAttendance([])
        setIsEditMode(true) // Enable edit mode for new attendance
      }
    } catch (error) {
      console.error('Failed to fetch existing attendance:', error)
      setIsEditMode(true) // Enable edit mode on error
    } finally {
      setLoadingExistingAttendance(false)
    }
  }

  const handleAttendanceChange = (staffId: string, status: string) => {
    if (!isEditMode) return // Prevent changes in read-only mode
    
    setAttendanceData(prev => ({
      ...prev,
      [staffId]: status
    }))
  }

  const handleSubmitAttendance = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // Check if at least one attendance is marked
      if (Object.keys(attendanceData).length === 0) {
        setMessage({ type: 'error', text: 'Please mark attendance for at least one staff member' })
        setSaving(false)
        return
      }

      // Prepare attendance records only for staff with marked attendance
      const attendanceRecords = staffMembers
        .filter(staff => attendanceData[staff.id]) // Only include staff with marked attendance
        .map(staff => ({
          staffId: staff.id,
          date: selectedDate,
          status: attendanceData[staff.id],
          remarks: ''
        }))

      if (attendanceRecords.length === 0) {
        setMessage({ type: 'error', text: 'Please mark attendance for at least one staff member' })
        setSaving(false)
        return
      }

      console.log('📤 Submitting attendance:', attendanceRecords)

      const result = await staffApi.markAttendance({
        date: selectedDate,
        records: attendanceRecords
      })

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Attendance marked successfully for ${attendanceRecords.length} staff member(s) on ${new Date(selectedDate).toLocaleDateString()}` 
        })
        // Refresh submitted dates and reload attendance for current date
        fetchSubmittedDates()
        fetchExistingAttendance(selectedDate)
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to mark attendance' })
      }
    } catch (error: any) {
      console.error('Submit attendance error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to submit attendance' })
    } finally {
      setSaving(false)
    }
  }

  const fetchAttendance = async () => {
    if (!selectedStaff) {
      setMessage({ type: 'error', text: 'Please select a staff member' })
      return
    }

    try {
      setViewLoading(true)
      setMessage(null)
      setAttendanceRecords([])
      setStats(null)
      
      const params: any = { staffId: selectedStaff }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      console.log('🔍 Fetching attendance with params:', params)

      const result = await staffApi.getAttendance(params)
      
      console.log('📊 Attendance result:', result)

      if (result.success) {
        const records = result.data?.attendance || []
        setAttendanceRecords(records)
        setStats(result.data?.stats || null)
        
        if (records.length === 0) {
          setMessage({ type: 'error', text: 'No attendance records found for the selected criteria. Please mark attendance first.' })
        } else {
          setMessage({ type: 'success', text: `Found ${records.length} attendance record(s)` })
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch attendance' })
      }
    } catch (error: any) {
      console.error('Fetch attendance error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to fetch attendance. Please check if attendance table exists.' })
    } finally {
      setViewLoading(false)
    }
  }

  const getDayName = (dateString: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800'
      case 'Absent': return 'bg-red-100 text-red-800'
      case 'Leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const fetchOverallAttendance = async () => {
    try {
      setOverallLoading(true)
      setMessage(null)
      setOverallData([])
      setSelectedStaffDetail(null) // Reset detailed view

      const params: any = {}
      if (overallStartDate) params.startDate = overallStartDate
      if (overallEndDate) params.endDate = overallEndDate

      console.log('🔍 Fetching overall attendance with params:', params)

      // Fetch attendance for all staff
      const result = await staffApi.getAttendance(params)

      console.log('📊 Overall attendance result:', result)

      if (result.success) {
        const allAttendance = result.data?.attendance || []

        // Group by staff and calculate stats
        const staffStats: { [key: string]: any } = {}

        staffMembers.forEach(staff => {
          const staffAttendance = allAttendance.filter((a: any) => a.staff_id === staff.id)
          const totalDays = staffAttendance.length
          const present = staffAttendance.filter((a: any) => a.status === 'Present').length
          const absent = staffAttendance.filter((a: any) => a.status === 'Absent').length
          const leave = staffAttendance.filter((a: any) => a.status === 'Leave').length
          const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

          staffStats[staff.id] = {
            id: staff.id,
            name: staff.user?.full_name || 'N/A',
            designation: staff.designation || 'N/A',
            department: staff.department || 'N/A',
            totalDays,
            present,
            absent,
            leave,
            percentage
          }
        })

        const statsArray = Object.values(staffStats)
        setOverallData(statsArray)

        if (statsArray.length === 0 || statsArray.every(s => s.totalDays === 0)) {
          setMessage({ type: 'error', text: 'No attendance records found for the selected date range. Please mark attendance first.' })
        } else {
          setMessage({ type: 'success', text: `Showing attendance summary for ${statsArray.filter(s => s.totalDays > 0).length} staff member(s)` })
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch overall attendance' })
      }
    } catch (error: any) {
      console.error('Fetch overall attendance error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to fetch overall attendance' })
    } finally {
      setOverallLoading(false)
    }
  }

  const handleStaffClick = async (staff: any) => {
    try {
      setDetailLoading(true)
      setSelectedStaffDetail(staff)
      setDetailedRecords([])
      setMessage(null)

      const params: any = { staffId: staff.id }
      if (overallStartDate) params.startDate = overallStartDate
      if (overallEndDate) params.endDate = overallEndDate

      console.log('🔍 Fetching detailed attendance for staff:', staff.name, params)

      const result = await staffApi.getAttendance(params)

      if (result.success) {
        const records = result.data?.attendance || []
        setDetailedRecords(records)
        
        if (records.length === 0) {
          setMessage({ type: 'error', text: `No attendance records found for ${staff.name}` })
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch detailed attendance' })
      }
    } catch (error: any) {
      console.error('Fetch detailed attendance error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to fetch detailed attendance' })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleBackToOverall = () => {
    setSelectedStaffDetail(null)
    setDetailedRecords([])
    setMessage(null)
  }

  const downloadOverallAttendanceExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = overallData
        .filter(staff => staff.totalDays > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .map((staff, index) => ({
          'S.No': index + 1,
          'Staff Name': staff.name,
          'Designation': staff.designation,
          'Department': staff.department,
          'Total Days': staff.totalDays,
          'Present': staff.present,
          'Absent': staff.absent,
          'Leave': staff.leave,
          'Attendance %': `${staff.percentage}%`
        }))

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      worksheet['!cols'] = [
        { wch: 6 },  // S.No
        { wch: 25 }, // Staff Name
        { wch: 20 }, // Designation
        { wch: 20 }, // Department
        { wch: 12 }, // Total Days
        { wch: 10 }, // Present
        { wch: 10 }, // Absent
        { wch: 10 }, // Leave
        { wch: 15 }  // Attendance %
      ]

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Overall Attendance')

      // Generate filename with date range
      const fromDate = overallStartDate ? new Date(overallStartDate).toLocaleDateString('en-IN').replace(/\//g, '-') : 'All'
      const toDate = overallEndDate ? new Date(overallEndDate).toLocaleDateString('en-IN').replace(/\//g, '-') : 'All'
      const filename = `Overall_Attendance_${fromDate}_to_${toDate}.xlsx`

      // Download file
      XLSX.writeFile(workbook, filename)

      setMessage({ type: 'success', text: 'Excel file downloaded successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Excel download error:', error)
      setMessage({ type: 'error', text: 'Failed to download Excel file' })
    }
  }

  // Calendar helper functions
  const isSunday = (date: Date) => {
    return date.getDay() === 0
  }

  const isDateSubmitted = (dateStr: string) => {
    return submittedDates.has(dateStr)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const date = new Date(year, month, day)
    
    // Check if it's Sunday
    if (isSunday(date)) {
      setMessage({ type: 'error', text: 'Cannot mark attendance on Sundays' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    // Format date properly to avoid timezone issues
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setShowCalendar(false)
    
    // Fetch existing attendance for the selected date
    fetchExistingAttendance(dateStr)
  }

  const handleStartDateSelect = (day: number) => {
    const year = startCalendarMonth.getFullYear()
    const month = startCalendarMonth.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setOverallStartDate(dateStr)
    setShowStartCalendar(false)
  }

  const handleEndDateSelect = (day: number) => {
    const year = endCalendarMonth.getFullYear()
    const month = endCalendarMonth.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setOverallEndDate(dateStr)
    setShowEndCalendar(false)
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = (
    currentMonthState: Date,
    setCurrentMonthState: (date: Date) => void,
    onDateSelect: (day: number) => void
  ) => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonthState)
    const days = []
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-1"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      // Format date properly to avoid timezone issues
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSun = isSunday(date)
      const isSubmitted = isDateSubmitted(dateStr)
      const isSelected = dateStr === selectedDate
      // Get today's date in same format
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const isToday = dateStr === todayStr
      const isFuture = date > new Date(todayStr)

      let className = 'p-1 text-center text-sm rounded cursor-pointer transition '
      
      if (isSun) {
        className += 'bg-red-100 text-red-400 cursor-not-allowed '
      } else if (isFuture) {
        className += 'bg-gray-100 text-gray-400 cursor-not-allowed '
      } else if (isSubmitted) {
        className += 'bg-green-100 text-green-800 hover:bg-green-200 '
      } else {
        className += 'hover:bg-blue-100 '
      }

      if (isSelected && !isSun && !isFuture) {
        className += 'ring-2 ring-blue-600 '
      }

      if (isToday) {
        className += 'font-bold '
      }

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => !isSun && !isFuture && onDateSelect(day)}
        >
          {day}
        </div>
      )
    }

    const changeMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentMonthState)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      setCurrentMonthState(newDate)
    }

    return (
      <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg p-3 w-64">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changeMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded active:scale-95 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold">{monthNames[month]} {year}</h3>
          <button
            onClick={() => changeMonth('next')}
            className="p-1 hover:bg-gray-100 rounded active:scale-95 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map(name => (
            <div key={name} className="text-center text-xs font-semibold text-gray-600 p-1">
              {name.charAt(0)}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span className="text-xs">Sunday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-xs">Submitted</span>
          </div>
        </div>
      </div>
    )
  }

  if (userRole === null || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Staff Attendance</h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('mark')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'mark'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'view'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              View Attendance
            </button>
          </div>
        </div>

        {/* Mark Attendance Tab */}
        {activeTab === 'mark' && (
          <>
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center gap-4">
                <label className="font-medium">Select Date:</label>
                <div className="relative calendar-container">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 active:scale-95 transition flex items-center gap-2 min-w-[200px]"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {selectedDate ? (
                      new Date(selectedDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    ) : (
                      <span className="text-gray-500">Select Date</span>
                    )}
                  </button>
                  {showCalendar && renderCalendar(currentMonth, setCurrentMonth, handleDateSelect)}
                </div>
              </div>
            </div>
            
            {!selectedDate ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-lg">Please select a date to mark attendance</p>
              </div>
            ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Mark Attendance for {new Date(selectedDate).toLocaleDateString()}
                  {existingAttendance.length > 0 && !isEditMode && (
                    <span className="ml-3 text-sm font-normal text-green-600">(Already Submitted)</span>
                  )}
                </h2>
                {existingAttendance.length > 0 && !isEditMode && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 bg-green-50 text-green-700 border-2 border-green-400 px-4 py-2 rounded-lg hover:bg-green-100 active:scale-95 transition text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Attendance
                  </button>
                )}
              </div>
              
              {staffMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No staff members found.</div>
              ) : loadingExistingAttendance ? (
                <div className="p-8 text-center text-gray-500">Loading attendance data...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {staffMembers.map((staff) => (
                          <tr key={staff.id} className={`hover:bg-gray-50 ${!isEditMode ? 'bg-gray-50' : ''}`}>
                            <td className="px-6 py-4 text-sm text-gray-900">{staff.user?.full_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{staff.department || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-4">
                                {['Present', 'Absent', 'Leave'].map((opt) => (
                                  <label key={opt} className={`flex items-center gap-2 text-sm ${isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                    <input 
                                      type="radio" 
                                      name={`attendance-${staff.id}`} 
                                      value={opt}
                                      checked={attendanceData[staff.id] === opt}
                                      onChange={() => handleAttendanceChange(staff.id, opt)}
                                      disabled={!isEditMode}
                                      className={isEditMode ? 'cursor-pointer' : 'cursor-not-allowed'}
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {isEditMode && (
                    <div className="p-6 border-t">
                      <button 
                        onClick={handleSubmitAttendance}
                        disabled={saving}
                        className="bg-blue-50 text-blue-700 border-2 border-blue-400 px-6 py-2 rounded-lg hover:bg-blue-100 active:scale-95 transition disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                      >
                        {saving ? 'Saving...' : existingAttendance.length > 0 ? 'Update Attendance' : 'Submit Attendance'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            )}
          </>
        )}

        {/* View Attendance Tab */}
        {activeTab === 'view' && (
          <>
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Show detailed view when a staff member is selected */}
            {selectedStaffDetail ? (
              <>
                {/* Back Button and Staff Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <button
                    onClick={handleBackToOverall}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 active:scale-95 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to View Attendance
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStaffDetail.name}</h2>
                      <p className="text-gray-600">{selectedStaffDetail.designation} - {selectedStaffDetail.department}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Days</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedStaffDetail.totalDays}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Attendance</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedStaffDetail.percentage}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-green-50">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Present</p>
                      <p className="text-3xl font-bold text-green-600">{selectedStaffDetail.present}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Absent</p>
                      <p className="text-3xl font-bold text-red-600">{selectedStaffDetail.absent}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Leave</p>
                      <p className="text-3xl font-bold text-yellow-600">{selectedStaffDetail.leave}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Attendance Records */}
                {detailLoading ? (
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <p className="text-gray-500">Loading attendance records...</p>
                  </div>
                ) : detailedRecords.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold">Detailed Attendance Records ({detailedRecords.length})</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {detailedRecords.map((record, index) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{getDayName(record.date)}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{record.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <p className="text-gray-500">No attendance records found.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* View Attendance Summary View */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">View Attendance Summary</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <div className="relative calendar-container">
                        <button
                          onClick={() => setShowStartCalendar(!showStartCalendar)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 active:scale-95 transition flex items-center gap-2"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {overallStartDate ? (
                            new Date(overallStartDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          ) : (
                            <span className="text-gray-500">Select Date</span>
                          )}
                        </button>
                        {showStartCalendar && renderCalendar(startCalendarMonth, setStartCalendarMonth, handleStartDateSelect)}
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <div className="relative calendar-container">
                        <button
                          onClick={() => setShowEndCalendar(!showEndCalendar)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 active:scale-95 transition flex items-center gap-2"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {overallEndDate ? (
                            new Date(overallEndDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          ) : (
                            <span className="text-gray-500">Select Date</span>
                          )}
                        </button>
                        {showEndCalendar && renderCalendar(endCalendarMonth, setEndCalendarMonth, handleEndDateSelect)}
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <button
                        onClick={fetchOverallAttendance}
                        disabled={overallLoading}
                        className="w-full bg-blue-50 text-blue-700 border-2 border-blue-400 px-6 py-2 rounded-lg hover:bg-blue-100 active:scale-95 transition disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                      >
                        {overallLoading ? 'Loading...' : 'Search'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* View Attendance Table */}
                {overallData.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Staff Attendance Summary (Click to view details)</h2>
                      <button
                        onClick={downloadOverallAttendanceExcel}
                        className="flex items-center gap-2 bg-green-50 text-green-700 border-2 border-green-400 px-4 py-2 rounded-lg hover:bg-green-100 active:scale-95 transition font-medium"
                        title="Download Excel"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Excel
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Days</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Leave</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {overallData
                            .filter(staff => staff.totalDays > 0)
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((staff, index) => (
                              <tr 
                                key={staff.id} 
                                onClick={() => handleStaffClick(staff)}
                                className="hover:bg-blue-50 cursor-pointer transition"
                              >
                                <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-blue-600">{staff.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{staff.designation}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{staff.department}</td>
                                <td className="px-6 py-4 text-sm text-center text-gray-900">{staff.totalDays}</td>
                                <td className="px-6 py-4 text-sm text-center">
                                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {staff.present}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    {staff.absent}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    {staff.leave}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                    staff.percentage >= 90 ? 'bg-green-100 text-green-800' :
                                    staff.percentage >= 75 ? 'bg-blue-100 text-blue-800' :
                                    staff.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {staff.percentage}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {overallData.filter(s => s.totalDays > 0).length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No attendance records found for the selected date range.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
