'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffListPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [filterDesignation, setFilterDesignation] = useState<string>('All')
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role || Number(role) !== 8) {
      router.push('/dashboard')
      return
    }
    setUserRole(Number(role))
    fetchStaff()
  }, [router])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students/teachers')
      const result = await response.json()

      if (result.success) {
        setStaffMembers(result.data)
      } else {
        console.error('Failed to fetch staff:', result.error)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userRole === null || loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Filter staff by designation
  const filteredStaff = filterDesignation === 'All' 
    ? staffMembers 
    : staffMembers.filter(staff => staff.designation === filterDesignation) 
    ? staffMembers 
    : staffMembers.filter(staff => staff.designation === filterDesignation)

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Staff List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Staff Members</h2>
              
              {/* Filter Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter by Designation:</label>
                <select
                  value={filterDesignation}
                  onChange={(e) => setFilterDesignation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Senior Teacher">Senior Teacher</option>
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <p className="text-sm text-gray-600 mt-3">
              Showing {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, index) => (
                    <tr key={staff.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{staff.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.mobile}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No staff members found{filterDesignation !== 'All' ? ` for "${filterDesignation}" designation` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
