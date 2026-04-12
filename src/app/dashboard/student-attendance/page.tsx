'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentAttendancePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('Nursery')

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
    { id: 1, rollNo: '001', name: 'Alice Johnson', class: 'Nursery' },
    { id: 2, rollNo: '002', name: 'Bob Williams', class: 'Nursery' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#5e3a9e] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-sm hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold">Student Attendance</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="font-medium mr-2">Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium mr-2">Class:</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option>Nursery</option>
                <option>LKG</option>
                <option>UKG</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Mark Attendance - {selectedClass}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input type="radio" name={`attendance-${student.id}`} value="present" defaultChecked className="mr-2" />
                          <span className="text-sm">Present</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name={`attendance-${student.id}`} value="absent" className="mr-2" />
                          <span className="text-sm">Absent</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name={`attendance-${student.id}`} value="leave" className="mr-2" />
                          <span className="text-sm">Leave</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t">
            <button className="bg-[#5e3a9e] text-white px-6 py-2 rounded-lg hover:bg-[#4a2d7e] transition">
              Submit Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
