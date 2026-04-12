'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const mobile = localStorage.getItem('userMobile')
    const role = localStorage.getItem('userRole')
    
    if (!mobile || !role) {
      router.push('/login')
      return
    }

    // Redirect to profile page by default
    router.push('/dashboard/profile')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userMobile')
    localStorage.removeItem('userRole')
    router.push('/login')
  }

  if (userRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Admin menu items
  const adminMenuItems = [
    { name: 'Profile', icon: '👤', path: '/dashboard/profile' },
    { name: 'Staff List', icon: '👥', path: '/dashboard/staff-list' },
    { name: 'Staff Attendance', icon: '📋', path: '/dashboard/staff-attendance' },
    { name: 'Class List', icon: '🏫', path: '/dashboard/class-list' },
    { name: 'Student List', icon: '👨‍🎓', path: '/dashboard/student-list' },
    { name: 'Student Attendance', icon: '✅', path: '/dashboard/student-attendance' },
    { name: 'Fees Management', icon: '💰', path: '/dashboard/fees' },
    { name: 'Calendar & Events', icon: '📅', path: '/dashboard/calendar' },
    { name: 'Salary', icon: '💵', path: '/dashboard/salary' },
    { name: 'Syllabus', icon: '📚', path: '/dashboard/syllabus' },
    { name: 'Homework', icon: '📝', path: '/dashboard/homework' },
    { name: 'Student Behaviour', icon: '⭐', path: '/dashboard/behaviour' },
    { name: 'Progress & Reports', icon: '📈', path: '/dashboard/reports' },
    { name: 'Admit Student', icon: '➕', path: '/dashboard/admit-student' },
    { name: 'Gallery', icon: '🖼️', path: '/dashboard/gallery' },
  ]

  // Faculty menu items
  const facultyMenuItems = [
    { name: 'Profile', icon: '👤', path: '/dashboard/profile' },
    { name: 'My Classes', icon: '🏫', path: '/dashboard/my-classes' },
    { name: 'Student List', icon: '👨‍🎓', path: '/dashboard/student-list' },
    { name: 'Attendance', icon: '✅', path: '/dashboard/student-attendance' },
    { name: 'Homework', icon: '📝', path: '/dashboard/homework' },
    { name: 'Syllabus', icon: '📚', path: '/dashboard/syllabus' },
  ]

  // Student menu items
  const studentMenuItems = [
    { name: 'Profile', icon: '👤', path: '/dashboard/profile' },
    { name: 'My Courses', icon: '📚', path: '/dashboard/my-courses' },
    { name: 'Attendance', icon: '✅', path: '/dashboard/my-attendance' },
    { name: 'Homework', icon: '📝', path: '/dashboard/my-homework' },
    { name: 'Progress Report', icon: '📈', path: '/dashboard/my-progress' },
    { name: 'Fees', icon: '💰', path: '/dashboard/my-fees' },
  ]

  const menuItems = userRole === 8 ? adminMenuItems : userRole === 6 ? facultyMenuItems : studentMenuItems
  const roleName = userRole === 8 ? 'Admin' : userRole === 6 ? 'Faculty' : 'Student'

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <img src="/LOGO-2.png" alt="Foster Kids" className="h-12 w-auto" />
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:bg-gray-100 p-2 rounded"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {userName}</h1>
              <p className="text-sm text-gray-500">{roleName} Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/dashboard/profile">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-blue-700 transition">
                  {userName.charAt(0)}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {/* Admin Dashboard */}
          {userRole === 8 && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👨‍🎓</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Staff</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">0</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Classes</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏫</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-3xl font-bold text-indigo-600 mt-2">₹0</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Link href="/dashboard/admit-student" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
                    <span className="text-3xl mb-2">➕</span>
                    <span className="text-xs text-center text-gray-700">Admit Student</span>
                  </Link>
                  <Link href="/dashboard/staff-attendance" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
                    <span className="text-3xl mb-2">📋</span>
                    <span className="text-xs text-center text-gray-700">Mark Attendance</span>
                  </Link>
                  <Link href="/dashboard/fees" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
                    <span className="text-3xl mb-2">💰</span>
                    <span className="text-xs text-center text-gray-700">Collect Fees</span>
                  </Link>
                  <Link href="/dashboard/homework" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
                    <span className="text-3xl mb-2">📝</span>
                    <span className="text-xs text-center text-gray-700">Assign Homework</span>
                  </Link>
                  <Link href="/dashboard/calendar" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
                    <span className="text-3xl mb-2">📅</span>
                    <span className="text-xs text-center text-gray-700">Add Event</span>
                  </Link>
                  <Link href="/dashboard/reports" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
                    <span className="text-3xl mb-2">📈</span>
                    <span className="text-xs text-center text-gray-700">View Reports</span>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 text-center py-8">No upcoming events</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Faculty Dashboard */}
          {userRole === 6 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">My Classes</h3>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">My Students</h3>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Homework</h3>
                  <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
              </div>
            </div>
          )}

          {/* Student Dashboard */}
          {userRole === 19 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">My Courses</h3>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Attendance</h3>
                  <p className="text-3xl font-bold text-green-600">0%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Homework</h3>
                  <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
