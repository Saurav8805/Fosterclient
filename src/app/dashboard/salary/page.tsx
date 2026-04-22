'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StaffMember {
  id: string
  user_id: string
  full_name: string
  designation: string
  salary: number
  mobile: string
}

export default function SalaryPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/list')
      const result = await response.json()

      if (result.success) {
        setStaffMembers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Staff Salary Records</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading staff records...</div>
          ) : staffMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No staff members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staffMembers.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{staff.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.mobile || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {staff.salary ? `₹${staff.salary.toLocaleString()}` : 'Not set'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-[#5e3a9e] hover:underline mr-3">Pay Salary</button>
                        <button className="text-[#5e3a9e] hover:underline">View History</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> This page shows the monthly salary configuration for each staff member. 
            To implement full salary payment tracking, additional features like payment history, salary slips, and payment status need to be developed.
          </p>
        </div>
      </div>
    </div>
  )
}
