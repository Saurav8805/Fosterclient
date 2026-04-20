'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface FeeRecord {
  id: string
  total_fees: number
  paid_amount: number
  pending_amount: number
  due_date: string
  status: string
  created_at: string
}

export default function FeesPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [feesData, setFeesData] = useState<FeeRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const id = localStorage.getItem('userId')
    if (!role || !id) { 
      router.push('/login')
      return 
    }
    setUserRole(Number(role))
    setUserId(id)
  }, [router])

  useEffect(() => {
    if (userRole === 19 && userId) {
      fetchFeesData()
    } else if (userRole !== null) {
      setLoading(false)
    }
  }, [userRole, userId])

  const fetchFeesData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fees/my-fees?userId=${userId}`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        setFeesData(result.data[0]) // Get the latest fee record
      } else {
        setError('No fees data found')
      }
    } catch (err) {
      console.error('Error fetching fees:', err)
      setError('Failed to load fees data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Student (role 19): view own fees status
  if (userRole === 19) {
    if (error || !feesData) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Fees Status</h1>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">{error || 'No fees data available'}</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Fees Status</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { label: 'Total Fees', value: feesData.total_fees, color: 'text-gray-900' },
            { label: 'Paid Amount', value: feesData.paid_amount, color: 'text-green-600' },
            { label: 'Pending Amount', value: feesData.pending_amount, color: 'text-red-600' },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">{item.label}</p>
                <p className={`text-3xl font-bold ${item.color}`}>₹{item.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mb-6">
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Payment Progress</h3></CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Paid: ₹{feesData.paid_amount.toLocaleString()}</span>
              <span className="text-sm font-medium text-gray-700">{((feesData.paid_amount / feesData.total_fees) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: `${(feesData.paid_amount / feesData.total_fees) * 100}%` }} />
            </div>
            {feesData.pending_amount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800"><span className="font-semibold">Due Date:</span> {formatDate(feesData.due_date)}</p>
                <p className="text-sm text-yellow-800 mt-1">Please pay the pending amount of ₹{feesData.pending_amount.toLocaleString()} before the due date.</p>
              </div>
            )}
            {feesData.pending_amount === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-semibold">✓ All fees paid! Thank you.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Fee Details</h3></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  feesData.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                  feesData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>{feesData.status}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Due Date</span>
                <span className="text-sm text-gray-900">{formatDate(feesData.due_date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Created On</span>
                <span className="text-sm text-gray-900">{formatDate(feesData.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Faculty (role 6) and Admin (role 8): manage all student fees
  const feeRecords = [
    { id: 1, student: 'Alice Johnson', class: 'Nursery', totalFees: 50000, paid: 30000, pending: 20000, status: 'Partial' },
    { id: 2, student: 'Bob Williams', class: 'LKG', totalFees: 55000, paid: 55000, pending: 0, status: 'Paid' },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
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
                {feeRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{rec.student}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{rec.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{rec.totalFees.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600">₹{rec.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-orange-600">₹{rec.pending.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${rec.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{rec.status}</span>
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
