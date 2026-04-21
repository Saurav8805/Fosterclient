'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  subject: string | null;
}

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('Nursery')
  
  // Student view state
  const [attendanceData, setAttendanceData] = useState<AttendanceStats>({
    totalDays: 0,
    present: 0,
    absent: 0,
    leave: 0,
    percentage: 0
  })
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  
  // Admin/Teacher view state
  const [students, setStudents] = useState<any[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const userId = localStorage.getItem('userId')
    
    if (!role || !userId) {
      router.push('/login')
      return
    }
    
    setUserRole(Number(role))
    
    // If student, fetch their attendance
    if (Number(role) === 19) {
      fetchStudentAttendance(userId)
    } else {
      setLoading(false)
    }
  }, [router])

  // Fetch students for admin/teacher when date changes
  useEffect(() => {
    if (userRole === 6 || userRole === 8) {
      fetchStudentsForAttendance()
    }
  }, [userRole, selectedDate])

  const fetchStudentAttendance = async (userId: string) => {
    try {
      const response = await fetch(`/api/attendance/my-attendance?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setAttendanceData(result.data.statistics)
        setRecentAttendance(result.data.records.slice(0, 10))
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsForAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance/mark?date=${selectedDate}`)
      const result = await response.json()

      if (result.success) {
        setStudents(result.data)
        // Pre-fill attendance map with existing attendance
        const map: Record<string, string> = {}
        result.data.forEach((student: any) => {
          if (student.attendance) {
            map[student.user_id] = student.attendance.status
          } else {
            map[student.user_id] = 'Present' // Default to Present
          }
        })
        setAttendanceMap(map)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const handleAttendanceChange = (userId: string, status: string) => {
    setAttendanceMap(prev => ({ ...prev, [userId]: status }))
  }

  const handleSubmitAttendance = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const promises = students.map(student => 
        fetch('/api/attendance/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: student.user_id,
            date: selectedDate,
            status: attendanceMap[student.user_id] || 'Present',
            subject: 'General'
          })
        })
      )

      await Promise.all(promises)
      setMessage({ type: 'success', text: 'Attendance saved successfully!' })
      
      // Refresh the data
      fetchStudentsForAttendance()
    } catch (error) {
      console.error('Failed to save attendance:', error)
      setMessage({ type: 'error', text: 'Failed to save attendance. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (userRole === null || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Student (role 19): view own attendance
  if (userRole === 19) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Attendance</h1>
        
        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Total Days</p>
              <p className="text-3xl font-bold text-gray-900">{attendanceData.totalDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Present</p>
              <p className="text-3xl font-bold text-green-600">{attendanceData.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Absent</p>
              <p className="text-3xl font-bold text-red-600">{attendanceData.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Attendance %</p>
              <p className="text-3xl font-bold text-blue-600">{attendanceData.percentage}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Progress */}
        <Card className="mb-6">
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Attendance Overview</h3></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Present', count: attendanceData.present, color: 'bg-green-600' },
                { label: 'Absent', count: attendanceData.absent, color: 'bg-red-600' },
                { label: 'Leave', count: attendanceData.leave, color: 'bg-yellow-500' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{row.label}</span>
                    <span className="text-sm font-medium text-gray-700">{row.count}/{attendanceData.totalDays}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${row.color} h-3 rounded-full`} 
                      style={{ width: `${attendanceData.totalDays > 0 ? (row.count / attendanceData.totalDays) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Recent Attendance</h3></CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subject</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{record.subject || 'General Activities'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                            record.status === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No attendance records found</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Faculty (role 6) and Admin (role 8): mark student attendance
  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Student Attendance</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="font-medium mr-2">Date:</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="text-sm text-gray-600">
              Marking attendance for {students.length} student{students.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Mark Attendance — {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          </div>
          <div className="overflow-x-auto">
            {students.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.roll_no || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.user?.full_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          {['Present', 'Absent', 'Leave'].map((status) => (
                            <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="radio" 
                                name={`attendance-${student.user_id}`} 
                                value={status}
                                checked={attendanceMap[student.user_id] === status}
                                onChange={() => handleAttendanceChange(student.user_id, status)}
                                className="w-4 h-4 text-blue-600 cursor-pointer"
                              />
                              <span className={
                                status === 'Present' ? 'text-green-700' :
                                status === 'Absent' ? 'text-red-700' :
                                'text-yellow-700'
                              }>{status}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No students found. Please add students first.
              </div>
            )}
          </div>
          {students.length > 0 && (
            <div className="p-6 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.values(attendanceMap).filter(s => s === 'Present').length} Present, {' '}
                {Object.values(attendanceMap).filter(s => s === 'Absent').length} Absent, {' '}
                {Object.values(attendanceMap).filter(s => s === 'Leave').length} Leave
              </div>
              <button 
                onClick={handleSubmitAttendance}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
