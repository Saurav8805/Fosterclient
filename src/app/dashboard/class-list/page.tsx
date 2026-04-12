'use client';

import Link from 'next/link'

export default function ClassListPage() {
  const classes = [
    { id: 1, name: 'Nursery', students: 25, teacher: 'John Doe' },
    { id: 2, name: 'LKG', students: 30, teacher: 'Jane Smith' },
    { id: 3, name: 'UKG', students: 28, teacher: 'Mike Johnson' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Class List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Classes</h2>
            <button className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition">
              + Add Class
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {classes.map((cls) => (
              <div key={cls.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-[#5e3a9e] mb-2">{cls.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Students: {cls.students}</p>
                <p className="text-sm text-gray-600 mb-4">Teacher: {cls.teacher}</p>
                <button className="text-[#5e3a9e] hover:underline text-sm">View Details →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
