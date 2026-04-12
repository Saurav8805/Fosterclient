'use client';

import Link from 'next/link'

export default function BehaviourPage() {
  const students = [
    { id: 1, name: 'Alice Johnson', class: 'Nursery', behaviour: 'Excellent', rating: 5 },
    { id: 2, name: 'Bob Williams', class: 'LKG', behaviour: 'Good', rating: 4 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#5e3a9e] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-sm hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold">Student Behaviour</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Behaviour Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Behaviour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.behaviour === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.behaviour}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < student.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">Edit</button>
                      <button className="text-[#5e3a9e] hover:underline">View Details</button>
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
