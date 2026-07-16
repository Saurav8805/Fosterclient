'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { studentsApi, staffApi, eventsApi } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalClasses: 3,
    revenue: 0
  })
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mobile = localStorage.getItem('userMobile')
    const role = localStorage.getItem('userRole')
    const name = localStorage.getItem('userName')
    const userId = localStorage.getItem('userId')
    
    if (!mobile || !role) {
      router.push('/login')
      return
    }

    setUserRole(Number(role))
    setUserName(name || 'User')
    
    // Fetch appropriate data based on role
    const roleNum = Number(role)
    if (roleNum === 6 || roleNum === 8) {
      // Admin/Principal
      fetchAdminStats()
    } else if (roleNum === 7) {
      // Teacher
      fetchTeacherStats(userId)
    } else if (roleNum === 19) {
      // Student
      fetchStudentStats(userId)
    } else {
      setLoading(false)
    }
  }, [router])

  const fetchAdminStats = async () => {
    try {
      console.log('📊 Fetching admin stats...')
      
      const [studentsResponse, staffResponse, eventsResponse] = await Promise.all([
        studentsApi.list(),
        staffApi.list(),
        eventsApi.list()
      ])
      
      console.log('👨‍🎓 Students response:', studentsResponse)
      console.log('👥 Staff response:', staffResponse)
      console.log('📅 Events response:', eventsResponse)
      
      // Students API returns: { success: true, data: { students: [...] } }
      const studentCount = studentsResponse.success && studentsResponse.data?.students 
        ? studentsResponse.data.students.length 
        : 0
      
      // Staff API returns: { success: true, data: [...] } (array directly)
      const staffCount = staffResponse.success && Array.isArray(staffResponse.data)
        ? staffResponse.data.length
        : 0
      
      console.log('✅ Calculated counts:', { studentCount, staffCount })
      
      setStats({
        totalStudents: studentCount,
        totalStaff: staffCount,
        totalClasses: 3,
        revenue: 0
      })

      // Process events
      if (eventsResponse.success && eventsResponse.data) {
        const events = eventsResponse.data
        const now = new Date()
        
        // Recent events (past events, last 5)
        const recent = events
          .filter((e: any) => new Date(e.date) < now)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
        
        // Upcoming events (future events, next 5)
        const upcoming = events
          .filter((e: any) => new Date(e.date) >= now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
        
        console.log('📅 Recent events:', recent.length)
        console.log('📅 Upcoming events:', upcoming.length)
        
        setRecentEvents(recent)
        setUpcomingEvents(upcoming)
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeacherStats = async (userId: string | null) => {
    try {
      // Fetch students count for teacher's classes and events
      const [studentsResponse, eventsResponse] = await Promise.all([
        studentsApi.list(),
        eventsApi.list()
      ])
      
      setStats({
        totalStudents: studentsResponse.success ? studentsResponse.data?.students?.length || 0 : 0,
        totalStaff: 0,
        totalClasses: 0,
        revenue: 0
      })

      // Process events
      if (eventsResponse.success && eventsResponse.data) {
        const events = eventsResponse.data
        const now = new Date()
        
        const recent = events
          .filter((e: any) => new Date(e.date) < now)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
        
        const upcoming = events
          .filter((e: any) => new Date(e.date) >= now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
        
        setRecentEvents(recent)
        setUpcomingEvents(upcoming)
      }
    } catch (error) {
      console.error('Failed to fetch teacher stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentStats = async (userId: string | null) => {
    try {
      // Fetch events for student
      const eventsResponse = await eventsApi.list()
      
      setStats({
        totalStudents: 0,
        totalStaff: 0,
        totalClasses: 0,
        revenue: 0
      })

      // Process events
      if (eventsResponse.success && eventsResponse.data) {
        const events = eventsResponse.data
        const now = new Date()
        
        const recent = events
          .filter((e: any) => new Date(e.date) < now)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
        
        const upcoming = events
          .filter((e: any) => new Date(e.date) >= now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
        
        setRecentEvents(recent)
        setUpcomingEvents(upcoming)
      }
    } catch (error) {
      console.error('Failed to fetch student stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (userRole === null || loading) {
    return null
  }

  const roleName = userRole === 6 ? 'Principal' : userRole === 7 ? 'Teacher' : userRole === 8 ? 'Admin' : 'Student'

  // Admin/Principal Dashboard
  if (userRole === 6 || userRole === 8) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalStudents}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalStaff}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalClasses}</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{formatDate(event.date)}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{formatDate(event.date)}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Teacher Dashboard
  if (userRole === 7) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Teacher Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Classes</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalClasses}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalStudents}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Homework</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/student-attendance" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-4xl mb-2">✅</span>
              <span className="text-sm text-center text-gray-700 font-medium">Mark Attendance</span>
            </Link>
            <Link href="/dashboard/homework" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-4xl mb-2">📝</span>
              <span className="text-sm text-center text-gray-700 font-medium">Assign Homework</span>
            </Link>
            <Link href="/dashboard/syllabus" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-4xl mb-2">📚</span>
              <span className="text-sm text-center text-gray-700 font-medium">Syllabus</span>
            </Link>
            <Link href="/dashboard/reports" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-4xl mb-2">📊</span>
              <span className="text-sm text-center text-gray-700 font-medium">Reports</span>
            </Link>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="text-center py-12 text-gray-500">
            <p>No classes scheduled for today</p>
          </div>
        </div>
      </div>
    )
  }

  // Student Dashboard
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance</p>
              <p className="text-3xl font-bold text-green-600 mt-2">-</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Fees</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">₹-</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Homework</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">-</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/student-attendance" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-4xl mb-2">✅</span>
            <span className="text-sm text-center text-gray-700 font-medium">My Attendance</span>
          </Link>
          <Link href="/dashboard/fees" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-4xl mb-2">💰</span>
            <span className="text-sm text-center text-gray-700 font-medium">Fees</span>
          </Link>
          <Link href="/dashboard/homework" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-4xl mb-2">📝</span>
            <span className="text-sm text-center text-gray-700 font-medium">Homework</span>
          </Link>
          <Link href="/dashboard/reports" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-4xl mb-2">📊</span>
            <span className="text-sm text-center text-gray-700 font-medium">Reports</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="text-center py-12 text-gray-500">
          <p>No upcoming events</p>
        </div>
      </div>
    </div>
  )
}
