'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeworkPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState('Nursery')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19

  const homeworkList = [
    { id: 1, title: 'Math Practice', class: 'Nursery', subject: 'Mathematics', dueDate: '2024-12-20', status: 'Pending' },
    { id: 2, title: 'English Reading', class: 'LKG', subject: 'English', dueDate: '2024-12-18', status: 'Submitted' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {!isStudent && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-4">
              <label className="font-medium">Select Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option>Nursery</option>
                <option>LKG</option>
                <option>UKG</option>
              </select>
              <button className="ml-auto bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm">
                + Assign Homework
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Homework List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {homeworkList.map((hw) => (
                  <tr key={hw.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{hw.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{hw.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{hw.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${hw.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {hw.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">View</button>
                      {!isStudent && (
                        <>
                          <button className="text-[#5e3a9e] hover:underline mr-3">Edit</button>
                          <button className="text-red-600 hover:underline">Delete</button>
                        </>
                      )}
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
