'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/dashboard')
      return
    }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div>Loading...</div>

  const students = [
    { id: 1, name: 'Alice Johnson', mobile: '9876543220', class: 'Nursery', rollNo: '001', status: 'Active' },
    { id: 2, name: 'Bob Williams', mobile: '9876543221', class: 'LKG', rollNo: '002', status: 'Active' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#5e3a9e] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-sm hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold">Student List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Students</h2>
            <Link href="/dashboard/admit-student" className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition">
              + Admit Student
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.mobile}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">View</button>
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
