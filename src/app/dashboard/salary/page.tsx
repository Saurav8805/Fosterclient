'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { staffApi, salaryApi } from '@/lib/api'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface StaffMember {
  id: string
  user_id: string
  designation: string
  salary: number
  user?: {
    full_name: string
    mobile: string
    email: string
  }
}

interface SalaryPayment {
  id: string
  staff_id: string
  amount: number
  payment_date: string
  payment_method: string
  remarks?: string
  created_at: string
}

export default function SalaryPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [salaryHistory, setSalaryHistory] = useState<SalaryPayment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    remarks: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const result = await staffApi.list()

      if (result.success && Array.isArray(result.data)) {
        setStaffMembers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaySalary = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setPaymentForm({
      amount: staff.salary?.toString() || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      remarks: ''
    })
    setShowPayModal(true)
    setMessage(null)
  }

  const handleViewHistory = async (staff: StaffMember) => {
    setSelectedStaff(staff)
    setShowHistoryModal(true)
    setLoadingHistory(true)
    
    try {
      const result = await salaryApi.getHistory(staff.id)
      if (result.success && Array.isArray(result.data)) {
        setSalaryHistory(result.data)
      } else {
        setSalaryHistory([])
      }
    } catch (error) {
      console.error('Failed to fetch salary history:', error)
      setSalaryHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

    setSaving(true)
    setMessage(null)

    try {
      const result = await salaryApi.paySalary({
        staffId: selectedStaff.id,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        remarks: paymentForm.remarks
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Salary payment recorded successfully!' })
        setShowPayModal(false)
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to record payment' })
      }
    } catch (error) {
      console.error('Failed to record payment:', error)
      setMessage({ type: 'error', text: 'Failed to record payment. Please try again.' })
    } finally {
      setSaving(false)
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Salary Management</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Staff Salary Records</h2>
        </CardHeader>

        <CardContent>
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
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{staff.user?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.designation || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{staff.user?.mobile || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {staff.salary ? `₹${staff.salary.toLocaleString()}` : 'Not set'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handlePaySalary(staff)}
                          className="text-[#5e3a9e] hover:underline mr-3 font-medium"
                        >
                          Pay Salary
                        </button>
                        <button 
                          onClick={() => handleViewHistory(staff)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Salary Modal */}
      {showPayModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Pay Salary</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedStaff.user?.full_name}</p>
              <p className="text-sm text-gray-500">{selectedStaff.designation}</p>
            </div>
            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
                <textarea
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#5e3a9e] text-white rounded-lg hover:bg-[#4a2d7e] transition disabled:opacity-50 font-medium"
                >
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View History Modal */}
      {showHistoryModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Salary Payment History</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedStaff.user?.full_name}</p>
              <p className="text-sm text-gray-500">{selectedStaff.designation}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="text-center py-12 text-gray-500">Loading history...</div>
              ) : salaryHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No payment history found.</p>
                  <p className="text-sm mt-2">Payments will appear here once recorded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {salaryHistory.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-lg text-gray-900">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {payment.payment_method}
                        </span>
                      </div>
                      {payment.remarks && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Note:</span> {payment.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
