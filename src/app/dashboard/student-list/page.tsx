'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const allStudents = [
  { id: 1, name: 'Alice Johnson', mobile: '9876543220', class: 'Nursery', rollNo: '001', status: 'Active' },
  { id: 2, name: 'Bob Williams', mobile: '9876543221', class: 'LKG', rollNo: '002', status: 'Active' },
  { id: 3, name: 'Carol Smith', mobile: '9876543222', class: 'UKG', rollNo: '003', status: 'Active' },
  { id: 4, name: 'David Brown', mobile: '9876543223', class: 'Nursery', rollNo: '004', status: 'Inactive' },
  { id: 5, name: 'Eva Green', mobile: '9876543224', class: 'LKG', rollNo: '005', status: 'Active' },
]

const classes = ['All', 'Nursery', 'LKG', 'UKG']

export default function StudentListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState('All')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div>Loading...</div>

  const filtered = selectedClass === 'All'
    ? allStudents
    : allStudents.filter(s => s.class === selectedClass)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Student List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Students</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter by Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">No students found for this class.</td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.mobile}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-[#5e3a9e] hover:underline mr-3">View</button>
                        <button className="text-[#5e3a9e] hover:underline mr-3">Edit</button>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
