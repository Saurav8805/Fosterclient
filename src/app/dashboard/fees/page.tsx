'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FeesPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role || Number(role) !== 8) {
      router.push('/dashboard')
      return
    }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div>Loading...</div>

  const feeRecords = [
    { id: 1, student: 'Alice Johnson', class: 'Nursery', totalFees: 50000, paid: 30000, pending: 20000, status: 'Partial' },
    { id: 2, student: 'Bob Williams', class: 'LKG', totalFees: 55000, paid: 55000, pending: 0, status: 'Paid' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#5e3a9e] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-sm hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold">Fees Management</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Collected</p>
            <p className="text-3xl font-bold text-green-600 mt-2">₹85,000</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Pending</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">₹20,000</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-[#5e3a9e] mt-2">₹1,05,000</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Fee Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{record.student}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{record.totalFees.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600">₹{record.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-orange-600">₹{record.pending.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">Collect</button>
                      <button className="text-[#5e3a9e] hover:underline">Receipt</button>
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
