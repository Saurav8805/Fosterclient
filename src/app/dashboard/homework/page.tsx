'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Homework {
  id: string
  title?: string
  description: string
  class: string
  subject: string
  due_date: string
  assigned_by: string
  created_at: string
  teacher?: {
    id: string
    full_name: string
  }
}

export default function HomeworkPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState('All')
  const [homeworkList, setHomeworkList] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  useEffect(() => {
    if (userRole !== null) {
      fetchHomework()
    }
  }, [userRole, selectedClass])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const url = selectedClass === 'All' 
        ? '/api/homework/list'
        : `/api/homework/list?class=${selectedClass}`
      
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setHomeworkList(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch homework:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19

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
                <option>All</option>
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
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading homework...</div>
          ) : homeworkList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No homework assigned yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {homeworkList.map((hw) => (
                    <tr key={hw.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.title || hw.description.substring(0, 30) + '...'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.class}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(hw.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hw.teacher?.full_name || 'N/A'}</td>
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
          )}
        </div>
      </div>
    </div>
  )
}
