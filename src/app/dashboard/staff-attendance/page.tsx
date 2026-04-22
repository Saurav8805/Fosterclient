'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface AttendanceRecord {
  id: string
  user_id: string
  date: string
  status: string
  subject: string | null
  created_at: string
}

interface AttendanceStats {
  totalDays: number
  present: number
  absent: number
  leave: number
  percentage: number
}

export default function StaffAttendancePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState<AttendanceStats>({
    totalDays: 0,
    present: 0,
    absent: 0,
    leave: 0,
    percentage: 0
  })
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [staffMembers, setStaffMembers] = useState<any[]>([])

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const id = localStorage.getItem('userId')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
    setUserId(id)
  }, [router])

  useEffect(() => {
    if (userRole === 6 && userId) {
      fetchMyAttendance()
    } else if (userRole === 8) {
      fetchStaffList()
    }
  }, [userRole, userId])

  const fetchMyAttendance = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/staff/attendance?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setAttendanceData(result.data.stats)
        setRecentAttendance(result.data.records.slice(0, 5)) // Get last 5 records
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/list')
      const result = await response.json()

      if (result.success) {
        setStaffMembers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (dateString: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Faculty (role 6): view own attendance summary
  if (userRole === 6) {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading attendance data...</div>
    }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Attendance</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Days', value: attendanceData.totalDays, color: 'text-gray-900' },
            { label: 'Present', value: attendanceData.present, color: 'text-green-600' },
            { label: 'Absent', value: attendanceData.absent, color: 'text-red-600' },
            { label: 'Attendance %', value: `${attendanceData.percentage}%`, color: 'text-blue-600' },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">{item.label}</p>
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
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
                      style={{ width: attendanceData.totalDays > 0 ? `${(row.count / attendanceData.totalDays) * 100}%` : '0%' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Recent Attendance</h3></CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No attendance records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Day</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{getDayName(record.date)}</td>
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
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin (role 8): mark all staff attendance
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading staff list...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Staff Attendance</h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Select Date:</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="px-4 py-2 border rounded-lg" 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Mark Attendance</h2>
          </div>
          
          {staffMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No staff members found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{staff.full_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            {['Present', 'Absent', 'Leave'].map((opt) => (
                              <label key={opt} className="flex items-center gap-1 text-sm">
                                <input 
                                  type="radio" 
                                  name={`attendance-${staff.id}`} 
                                  value={opt} 
                                  defaultChecked={opt === 'Present'} 
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
              
              <div className="p-6 border-t">
                <button className="bg-[#5e3a9e] text-white px-6 py-2 rounded-lg hover:bg-[#4a2d7e] transition">
                  Submit Attendance
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
