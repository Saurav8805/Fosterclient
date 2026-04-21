'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  
  // Admin/Faculty state - must be declared at top level
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [feeForm, setFeeForm] = useState({
    totalFees: '',
    paidAmount: '',
    dueDate: '',
    status: 'Pending'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
    } else if (userRole === 6 || userRole === 8) {
      fetchAllStudentsFees()
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
        setFeesData(result.data[0])
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

  const fetchAllStudentsFees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fees/update')
      const result = await response.json()

      if (result.success) {
        setStudents(result.data)
      }
    } catch (err) {
      console.error('Error fetching students fees:', err)
      setMessage({ type: 'error', text: 'Failed to load students fees' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFees = (student: any) => {
    setSelectedStudent(student)
    const fees = student.fees?.[0]
    setFeeForm({
      totalFees: fees?.total_fees?.toString() || '',
      paidAmount: fees?.paid_amount?.toString() || '',
      dueDate: fees?.due_date || '',
      status: fees?.status || 'Pending'
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    const totalFees = parseFloat(feeForm.totalFees)
    const paidAmount = parseFloat(feeForm.paidAmount)
    const pendingAmount = totalFees - paidAmount

    console.log('Submitting fees:', {
      studentId: selectedStudent.id,
      studentName: selectedStudent.user?.full_name,
      totalFees,
      paidAmount,
      pendingAmount,
      dueDate: feeForm.dueDate,
      status: feeForm.status
    })

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/fees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          totalFees,
          paidAmount,
          pendingAmount,
          dueDate: feeForm.dueDate,
          status: feeForm.status
        })
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (result.success) {
        setMessage({ type: 'success', text: 'Fees updated successfully!' })
        setShowModal(false)
        // Refresh the data
        await fetchAllStudentsFees()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update fees' })
      }
    } catch (error) {
      console.error('Failed to update fees:', error)
      setMessage({ type: 'error', text: 'Failed to update fees. Please try again.' })
    } finally {
      setSaving(false)
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
  const totalCollected = students.reduce((sum, s) => sum + (s.fees?.[0]?.paid_amount || 0), 0)
  const totalPending = students.reduce((sum, s) => sum + (s.fees?.[0]?.pending_amount || 0), 0)
  const totalRevenue = students.reduce((sum, s) => sum + (s.fees?.[0]?.total_fees || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Fees Management</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Collected</p>
            <p className="text-3xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Pending</p>
            <p className="text-3xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Student Fee Records</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {students.length > 0 ? (
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
                  {students.map((student) => {
                    const fees = student.fees?.[0]
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.user?.full_name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.class || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">₹{(fees?.total_fees || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-green-600">₹{(fees?.paid_amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-orange-600">₹{(fees?.pending_amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            fees?.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                            fees?.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fees?.status || 'Not Set'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => handleUpdateFees(student)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {fees ? 'Update' : 'Set Fees'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No students found. Please add students first.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Fees Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Update Fees</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedStudent.user?.full_name}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Fees (₹)</label>
                <input
                  type="number"
                  value={feeForm.totalFees}
                  onChange={(e) => setFeeForm({...feeForm, totalFees: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount (₹)</label>
                <input
                  type="number"
                  value={feeForm.paidAmount}
                  onChange={(e) => setFeeForm({...feeForm, paidAmount: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({...feeForm, dueDate: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={feeForm.status}
                  onChange={(e) => setFeeForm({...feeForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {feeForm.totalFees && feeForm.paidAmount && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Pending: ₹{(parseFloat(feeForm.totalFees) - parseFloat(feeForm.paidAmount)).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Fees'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
