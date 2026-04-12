'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StaffListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role || Number(role) !== 8) {
      router.push('/dashboard')
      return
    }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div>Loading...</div>

  const staffMembers = [
    { id: 1, name: 'John Doe', mobile: '9876543210', role: 'Teacher', subject: 'Mathematics', status: 'Active' },
    { id: 2, name: 'Jane Smith', mobile: '9876543211', role: 'Teacher', subject: 'English', status: 'Active' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Staff List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Staff Members</h2>
            <button className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition">
              + Add Staff
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{staff.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{staff.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{staff.mobile}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{staff.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{staff.subject}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">Edit</button>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
