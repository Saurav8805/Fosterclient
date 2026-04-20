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
  const students = [
    { id: 1, rollNo: '001', name: 'Alice Johnson' },
    { id: 2, rollNo: '002', name: 'Bob Williams' },
    { id: 3, rollNo: '003', name: 'Carol Smith' },
  ]
  
  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Student Attendance</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="font-medium mr-2">Date:</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="font-medium mr-2">Class:</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 border rounded-lg">
                <option>Nursery</option><option>LKG</option><option>UKG</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Mark Attendance — {selectedClass}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        {['present', 'absent', 'leave'].map((opt) => (
                          <label key={opt} className="flex items-center gap-1 text-sm capitalize">
                            <input type="radio" name={`attendance-${student.id}`} value={opt} defaultChecked={opt === 'present'} />
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
          <div className="p-6 border-t">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Submit Attendance</button>
          </div>
        </div>
      </div>
    </div>
  )
}
