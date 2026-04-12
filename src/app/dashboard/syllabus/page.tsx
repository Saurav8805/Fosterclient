'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyllabusPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19

  const syllabusData = [
    { id: 1, class: 'Nursery', subject: 'English', topics: 'Alphabets A-Z, Phonics', status: 'Active' },
    { id: 2, class: 'LKG', subject: 'Mathematics', topics: 'Numbers 1-20, Shapes', status: 'Active' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Syllabus</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Syllabus Overview</h2>
            {!isStudent && (
              <button className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm">
                + Add Syllabus
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {syllabusData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.topics}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{item.status}</span>
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
