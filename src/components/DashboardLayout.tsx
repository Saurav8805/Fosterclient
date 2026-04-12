'use client';

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebar } from '@/components/ui/sidebar'

interface DashboardSidebarProps {
  className?: string
}

export default function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role) {
      setUserRole(Number(role))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userMobile')
    localStorage.removeItem('userRole')
    router.push('/login')
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
    { name: 'My Attendance', icon: '✅', path: '/dashboard/my-attendance' },
    { name: 'Fees Status', icon: '💰', path: '/dashboard/my-fees' },
    { name: 'Calendar & Events', icon: '📅', path: '/dashboard/calendar' },
    { name: 'Syllabus', icon: '📚', path: '/dashboard/syllabus' },
    { name: 'Homework', icon: '📝', path: '/dashboard/homework' },
    { name: 'My Behaviour', icon: '⭐', path: '/dashboard/my-behaviour' },
    { name: 'Progress & Reports', icon: '📈', path: '/dashboard/my-progress' },
    { name: 'Gallery', icon: '🖼️', path: '/dashboard/gallery' },
  ]

  const menuItems = userRole === 8 ? adminMenuItems : userRole === 6 ? facultyMenuItems : studentMenuItems

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col flex-shrink-0 h-full ${className}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isOpen && (
            <img src="/LOGO-2.png" alt="Foster Kids" className="h-12 w-auto" />
          )}
          <button 
            onClick={toggle}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded transition"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`flex items-center px-4 py-3 transition ${
              pathname === item.path 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
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
          {isOpen && <span className="ml-3 text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
