'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salaryApi } from '@/lib/api';

// Types
type Staff = {
  id: string;
  name: string;
  mobile: string;
  designation: string;
  department?: string;
  role: number;
  baseSalary: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Paid' | 'Partial' | 'Pending'; 
  lastPaymentDate?: string;
  assignedClass?: string;
  assignedSection?: string;
};

type PaymentHistory = {
  id: string;
  payment_date?: string;
  date?: string;
  amount: number;
  payment_mode?: string;
  mode?: string;
  month: string;
  year: number | string;
  remarks?: string;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const YEARS = [2024, 2025, 2026, 2027];

export default function SalaryManagementPage() {
  const router = useRouter();
  const currentDate = new Date();
  
  // State: Filters
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // State: Data
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State: Pay Modal
  const [payModalOpen, setPayModalOpen] = useState<boolean>(false);
  const [selectedStaffForPay, setSelectedStaffForPay] = useState<Staff | null>(null);
  const [payFormData, setPayFormData] = useState({
    amount: 0,
    paymentDate: currentDate.toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    month: selectedMonth,
    year: selectedYear,
    remarks: ''
  });
  const [paySubmitting, setPaySubmitting] = useState<boolean>(false);
  const [payMessage, setPayMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // State: Edit Salary Modal
  const [editSalaryModalOpen, setEditSalaryModalOpen] = useState<boolean>(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Staff | null>(null);
  const [newSalaryAmount, setNewSalaryAmount] = useState<number>(0);
  const [editSalarySubmitting, setEditSalarySubmitting] = useState<boolean>(false);

  // State: History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [selectedStaffForHistory, setSelectedStaffForHistory] = useState<Staff | null>(null);
  const [staffHistory, setStaffHistory] = useState<PaymentHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchStaffData();
  }, [selectedMonth, selectedYear]);

  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salaryApi.staffList({ month: selectedMonth, year: String(selectedYear) });
      if (response.success && Array.isArray(response.data)) {
        setStaffList(response.data);
      } else {
        setStaffList([]);
      }
    } catch (err: any) {
      console.error('Fetch staff error:', err);
      setError(err.message || 'Failed to fetch staff list');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (staff: Staff) => {
    setSelectedStaffForPay(staff);
    setPayFormData({
      amount: staff.pendingAmount > 0 ? staff.pendingAmount : staff.baseSalary,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      month: selectedMonth,
      year: selectedYear,
      remarks: ''
    });
    setPayMessage(null);
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setSelectedStaffForPay(null);
    setPayMessage(null);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPay) return;

    // Prevent overpayment
    const maxPayable = selectedStaffForPay.pendingAmount;
    if (payFormData.amount > maxPayable) {
      setPayMessage({ type: 'error', text: `Cannot pay more than pending amount (₹${maxPayable.toLocaleString('en-IN')})` });
      return;
    }
    if (payFormData.amount <= 0) {
      setPayMessage({ type: 'error', text: 'Payment amount must be greater than zero' });
      return;
    }
    
    setPaySubmitting(true);
    setPayMessage(null);
    try {
      const res = await salaryApi.paySalary({
        staffId: selectedStaffForPay.id,
        ...payFormData
      });
      if (res.success) {
        setPayMessage({ type: 'success', text: 'Salary payment recorded successfully!' });
        await fetchStaffData();
        setTimeout(() => closePayModal(), 1200);
      } else {
        setPayMessage({ type: 'error', text: res.error || 'Failed to record payment' });
      }
    } catch (err: any) {
      setPayMessage({ type: 'error', text: err.message || 'Failed to record payment' });
    } finally {
      setPaySubmitting(false);
    }
  };

  const openEditSalaryModal = (staff: Staff) => {
    setSelectedStaffForEdit(staff);
    setNewSalaryAmount(staff.baseSalary);
    setEditSalaryModalOpen(true);
  };

  const handleEditSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForEdit || newSalaryAmount <= 0) return;

    setEditSalarySubmitting(true);
    try {
      const res = await salaryApi.updateSalary(selectedStaffForEdit.id, newSalaryAmount);
      if (res.success) {
        setEditSalaryModalOpen(false);
        await fetchStaffData();
      }
    } catch (err) {
      console.error('Failed to update salary:', err);
    } finally {
      setEditSalarySubmitting(false);
    }
  };

  const openHistoryModal = async (staff: Staff) => {
    setSelectedStaffForHistory(staff);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const response = await salaryApi.getHistory(staff.id);
      if (response.success && Array.isArray(response.data)) {
        setStaffHistory(response.data);
      } else {
        setStaffHistory([]);
      }
    } catch (err: any) {
      console.error('History fetch error:', err);
      setStaffHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedStaffForHistory(null);
    setStaffHistory([]);
  };

  // Metrics
  const totalStaff = staffList.length;
  const totalPayroll = staffList.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0);
  const paidStaff = staffList.filter(s => s.status === 'Paid');
  const totalPaidAmount = staffList.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const pendingCount = totalStaff - paidStaff.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
          <p className="text-gray-500 mt-1">Manage staff payroll, track paid/pending amounts and view payment history</p>
        </div>
      </div>

      {/* Month & Year Selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Month:</label>
          <select 
            className="w-44 px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none bg-white font-medium"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Year:</label>
          <select 
            className="w-32 px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none bg-white font-medium"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm border-t-4 border-t-[#5e3a9e]">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Staff</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{totalStaff}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm border-t-4 border-t-purple-500">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Monthly Payroll</h3>
          <p className="text-3xl font-bold mt-2 text-[#5e3a9e]">₹ {totalPayroll.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm border-t-4 border-t-emerald-500">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Disbursed ({selectedMonth})</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-600">₹ {totalPaidAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">{paidStaff.length} of {totalStaff} staff paid</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm border-t-4 border-t-amber-500">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending Staff</h3>
          <p className="text-3xl font-bold mt-2 text-amber-600">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pending payment status</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            Staff Payroll List — {selectedMonth} {selectedYear}
          </h2>
          <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-[#5e3a9e] rounded-full">
            {staffList.length} Staff Member{staffList.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 font-semibold">
                <th className="p-4">#</th>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Department & Designation</th>
                <th className="p-4">Base Salary</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Pending</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-2"></div>
                    <p className="text-xs">Loading staff payroll data...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-rose-500">{error}</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    No staff records found in system. Add staff members in Staff panel first.
                  </td>
                </tr>
              ) : (
                staffList.map((staff, idx) => (
                  <tr key={staff.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 font-mono font-semibold text-gray-400 text-xs">{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{staff.name}</div>
                      <div className="text-xs text-gray-500">{staff.mobile}</div>
                      {staff.assignedClass && (
                        <div className="text-[11px] text-[#5e3a9e] font-semibold">
                          Class: {staff.assignedClass}-{staff.assignedSection || 'A'}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{staff.designation || 'Teacher'}</div>
                      <div className="text-xs text-gray-500">{staff.department || 'Teaching'}</div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>₹ {staff.baseSalary.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => openEditSalaryModal(staff)}
                          title="Edit Base Salary"
                          className="text-gray-400 hover:text-[#5e3a9e] text-xs p-1 rounded hover:bg-gray-100"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-emerald-700">
                      ₹ {staff.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-semibold text-rose-600">
                      ₹ {staff.pendingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        staff.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : staff.status === 'Partial'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {staff.status === 'Paid'
                          ? 'Paid'
                          : staff.status === 'Partial'
                          ? `Partial (₹${staff.pendingAmount.toLocaleString('en-IN')} Pending)`
                          : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {staff.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 cursor-default whitespace-nowrap min-w-[60px] justify-center">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Paid
                          </span>
                        ) : (
                          <button 
                            onClick={() => openPayModal(staff)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-[10px] font-bold shadow-sm whitespace-nowrap touch-manipulation min-w-[60px]"
                          >
                            Pay
                          </button>
                        )}
                        <button 
                          onClick={() => openHistoryModal(staff)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-[10px] font-bold whitespace-nowrap touch-manipulation min-w-[60px]"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Salary Modal */}
      {payModalOpen && selectedStaffForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-[#5e3a9e] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Record Salary Payment</h3>
                <p className="text-xs text-purple-200">{selectedStaffForPay.name} ({selectedStaffForPay.designation})</p>
              </div>
              <button onClick={closePayModal} className="text-white/80 hover:text-white text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
              {payMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium ${payMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {payMessage.text}
                </div>
              )}

              {/* Salary Breakdown Card */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Base Salary</span>
                  <span className="font-bold text-gray-900">₹ {selectedStaffForPay.baseSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Already Paid ({payFormData.month})</span>
                  <span className="font-bold text-emerald-700">₹ {selectedStaffForPay.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-xs">
                  <span className="text-gray-700 font-semibold">Remaining to Pay</span>
                  <span className="font-bold text-rose-600">₹ {selectedStaffForPay.pendingAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
                  <input type="text" readOnly value={payFormData.month} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
                  <input type="text" readOnly value={payFormData.year} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Amount (₹) <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={selectedStaffForPay.pendingAmount}
                  value={payFormData.amount} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPayFormData({...payFormData, amount: Math.min(val, selectedStaffForPay!.pendingAmount)});
                  }}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none font-bold"
                />
                <p className="text-[10px] text-gray-400 mt-1">Max payable: ₹ {selectedStaffForPay.pendingAmount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date</label>
                <input 
                  type="date" 
                  required
                  value={payFormData.paymentDate} 
                  onChange={(e) => setPayFormData({...payFormData, paymentDate: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode</label>
                <select 
                  value={payFormData.paymentMode}
                  onChange={(e) => setPayFormData({...payFormData, paymentMode: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks / Note</label>
                <textarea 
                  rows={2}
                  value={payFormData.remarks}
                  onChange={(e) => setPayFormData({...payFormData, remarks: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                  placeholder="Optional payment reference or transaction note..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t">
                <button type="button" onClick={closePayModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={paySubmitting}
                  className="px-5 py-2 bg-[#5e3a9e] text-white rounded-xl hover:bg-[#4a2d7e] transition text-sm font-semibold disabled:opacity-50"
                >
                  {paySubmitting ? 'Recording...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Base Salary Modal */}
      {editSalaryModalOpen && selectedStaffForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-[#5e3a9e] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Edit Base Salary</h3>
                <p className="text-xs text-purple-200">{selectedStaffForEdit.name}</p>
              </div>
              <button onClick={() => setEditSalaryModalOpen(false)} className="text-white/80 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleEditSalarySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Monthly Base Salary (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newSalaryAmount}
                  onChange={(e) => setNewSalaryAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none font-bold"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditSalaryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSalarySubmitting}
                  className="px-5 py-2 bg-[#5e3a9e] text-white rounded-xl hover:bg-[#4a2d7e] transition text-sm font-semibold disabled:opacity-50"
                >
                  {editSalarySubmitting ? 'Saving...' : 'Update Base Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyModalOpen && selectedStaffForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b bg-[#5e3a9e] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Salary Payment History</h3>
                <p className="text-xs text-purple-200">{selectedStaffForHistory.name} ({selectedStaffForHistory.designation})</p>
              </div>
              <button onClick={closeHistoryModal} className="text-white/80 hover:text-white text-lg font-bold">✕</button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-2"></div>
                  <p className="text-xs">Loading payment records...</p>
                </div>
              ) : staffHistory.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-sm">No payment history recorded for this staff member yet.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="p-3.5">Payment Date</th>
                      <th className="p-3.5">Month/Year</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Mode</th>
                      <th className="p-3.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {staffHistory.map(record => (
                      <tr key={record.id} className="hover:bg-purple-50/20">
                        <td className="p-3.5 font-mono text-xs">{record.payment_date || record.date || 'N/A'}</td>
                        <td className="p-3.5 font-semibold text-gray-800">{record.month} {record.year}</td>
                        <td className="p-3.5 font-bold text-emerald-700">₹ {record.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-xs font-semibold text-gray-600">{record.payment_mode || record.mode || 'Cash'}</td>
                        <td className="p-3.5 text-xs text-gray-500">{record.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button onClick={closeHistoryModal} className="px-5 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-xl text-xs font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
