'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Get user data from localStorage or session
    const mobile = localStorage.getItem('userMobile')
    const role = localStorage.getItem('userRole')
    
    if (!mobile || !role) {
      router.push('/login')
      return
    }

    setUserRole(Number(role))
    setUserName(mobile)
  }, [router])

  const getRoleName = (role: number) => {
    switch(role) {
      case 6: return 'Faculty'
      case 8: return 'Admin'
      case 19: return 'Student'
      default: return 'User'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userMobile')
    localStorage.removeItem('userRole')
    router.push('/login')
  }

  if (userRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome, {userName}</p>
              <p className="text-sm text-gray-500">Role: {getRoleName(userRole)} (Flag: {userRole})</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Admin Dashboard */}
        {userRole === 8 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Total Students</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Total Faculty</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Total Classes</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        )}

        {/* Faculty Dashboard */}
        {userRole === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">My Classes</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-teal-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">My Students</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        )}

        {/* Student Dashboard */}
        {userRole === 19 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-pink-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">My Courses</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-orange-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Attendance</h3>
              <p className="text-3xl font-bold">0%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
