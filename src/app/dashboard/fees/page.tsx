'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { feesApi } from '@/lib/api';

const CLASSES = ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const PAYMENT_MODES = ['Cash', 'Online', 'Cheque', 'UPI', 'Bank Transfer'];

export default function FeesPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<number>(19);
  const [userId, setUserId] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Student view state
  const [myFees, setMyFees] = useState<any[]>([]);

  // Admin/Teacher view state
  const [feesList, setFeesList] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [summary, setSummary] = useState({ totalFees: 0, totalCollected: 0, totalPending: 0, paidCount: 0, pendingCount: 0 });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [editForm, setEditForm] = useState({ totalFees: '', paidAmount: '', dueDate: '', status: 'Pending' });
  const [editLoading, setEditLoading] = useState(false);

  // Collect modal
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectingFor, setCollectingFor] = useState<any>(null);
  const [collectForm, setCollectForm] = useState({ amount: '', paymentMode: 'Cash', month: MONTHS[new Date().getMonth()], year: String(new Date().getFullYear()), remarks: '' });
  const [collectLoading, setCollectLoading] = useState(false);

  useEffect(() => {
    const role = Number(localStorage.getItem('userRole') || 19);
    const uid = localStorage.getItem('userId') || '';
    const sid = localStorage.getItem('studentId') || '';
    setUserRole(role);
    setUserId(uid);
    setStudentId(sid);
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (userRole === 19) {
      loadMyFees();
    } else {
      loadFeesList();
      loadSummary();
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (userRole !== 19 && userId) {
      loadFeesList();
    }
  }, [filterClass, filterSection, filterStatus, filterYear]);

  const loadMyFees = async () => {
    setLoading(true);
    const sid = studentId || userId;
    const res = await feesApi.getMyFees(sid);
    if (res.success) setMyFees(res.data || []);
    setLoading(false);
  };

  const loadFeesList = async () => {
    setLoading(true);
    const params: any = {};
    if (filterClass) params.class = filterClass;
    if (filterSection) params.section = filterSection;
    if (filterStatus !== 'All') params.status = filterStatus;
    if (filterYear) params.year = filterYear;
    const res = await feesApi.list(params);
    if (res.success) setFeesList(res.data || []);
    setLoading(false);
  };

  const loadSummary = async () => {
    const res = await feesApi.summary();
    if (res.success) setSummary(res.data || summary);
  };

  const stats = useMemo(() => {
    const total = feesList.length;
    const paid = feesList.filter(f => f.status === 'Paid').length;
    const pending = feesList.filter(f => f.status !== 'Paid').length;
    const totalAmt = feesList.reduce((s, f) => s + (Number(f.totalFees) || 0), 0);
    const paidAmt = feesList.reduce((s, f) => s + (Number(f.paidAmount) || 0), 0);
    const pendingAmt = feesList.reduce((s, f) => s + (Number(f.pendingAmount) || 0), 0);
    return { total, paid, pending, totalAmt, paidAmt, pendingAmt };
  }, [feesList]);

  const openEdit = (fee: any) => {
    setEditingFee(fee);
    setEditForm({
      totalFees: String(fee.totalFees || ''),
      paidAmount: String(fee.paidAmount || ''),
      dueDate: fee.dueDate || '',
      status: fee.status === 'Not Set' ? 'Pending' : fee.status || 'Pending'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    const total = Number(editForm.totalFees);
    const paid = Number(editForm.paidAmount);
    const pending = total - paid;
    const status = paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';
    const res = await feesApi.update({
      studentId: editingFee.studentId,
      totalFees: total,
      paidAmount: paid,
      pendingAmount: Math.max(0, pending),
      dueDate: editForm.dueDate || null,
      status: editForm.status || status,
      academicYear: filterYear
    });
    if (res.success) {
      setSuccess('Fees updated successfully!');
      setShowEditModal(false);
      loadFeesList();
      loadSummary();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update fees');
    }
    setEditLoading(false);
  };

  const openCollect = (fee: any) => {
    setCollectingFor(fee);
    setCollectForm({ 
      amount: fee.pendingAmount > 0 ? String(fee.pendingAmount) : '', 
      paymentMode: 'Cash', 
      month: MONTHS[new Date().getMonth()], 
      year: String(new Date().getFullYear()), 
      remarks: '' 
    });
    setError('');
    setShowCollectModal(true);
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollectLoading(true);
    setError('');

    const amt = Number(collectForm.amount);
    const maxPayable = Number(collectingFor.pendingAmount || 0);

    if (maxPayable > 0 && amt > maxPayable) {
      setError(`Cannot collect more than remaining balance (₹${maxPayable.toLocaleString()})`);
      setCollectLoading(false);
      return;
    }

    const res = await feesApi.collect({
      studentId: collectingFor.studentId,
      amount: amt,
      paymentMode: collectForm.paymentMode,
      month: collectForm.month,
      year: collectForm.year,
      academicYear: filterYear,
      remarks: collectForm.remarks
    });
    if (res.success) {
      setSuccess(`Payment of ₹${collectForm.amount} collected successfully!`);
      setShowCollectModal(false);
      loadFeesList();
      loadSummary();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to collect payment');
    }
    setCollectLoading(false);
  };

  const statusBadge = (status: string, pendingAmount: number = 0) => {
    if (status === 'Paid') return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (status === 'Partial') return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (status === 'Pending') return 'bg-rose-100 text-rose-800 border border-rose-300';
    return 'bg-gray-100 text-gray-500 border border-gray-200';
  };

  // ─── STUDENT VIEW ────────────────────────────────────────────────────────────
  if (userRole === 19) {
    const fee = myFees[0];
    const paidPct = fee ? Math.min(100, (Number(fee.paid_amount) / Number(fee.total_fees || 1)) * 100) : 0;
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Fees Status</h1>
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#5e3a9e] border-t-transparent rounded-full animate-spin" /></div>
        ) : !fee ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No fee records available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Please contact the school office for fee details.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#5e3a9e] to-[#7c52c8] p-6 text-white">
              <p className="text-sm opacity-80">Fee Status</p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-bold">₹{Number(fee.total_fees || 0).toLocaleString()}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fee.status === 'Paid' ? 'bg-green-400 text-green-900' : fee.status === 'Partial' ? 'bg-yellow-300 text-yellow-900' : 'bg-red-400 text-red-900'}`}>{fee.status || 'Pending'}</span>
              </div>
              <p className="text-sm opacity-70 mt-1">Total Annual Fees</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium">Amount Paid</p>
                  <p className="text-xl font-bold text-green-700 mt-1">₹{Number(fee.paid_amount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-red-600 font-medium">Amount Pending</p>
                  <p className="text-xl font-bold text-red-700 mt-1">₹{Number(fee.pending_amount || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Payment Progress</span>
                  <span>{paidPct.toFixed(0)}% paid</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-[#5e3a9e] h-3 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                </div>
              </div>
              {fee.due_date && (
                <div className={`rounded-lg p-3 text-sm ${new Date(fee.due_date) < new Date() && fee.status !== 'Paid' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                  📅 Due Date: <span className="font-semibold">{new Date(fee.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  {new Date(fee.due_date) < new Date() && fee.status !== 'Paid' && <span className="ml-2 font-bold">OVERDUE</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── ADMIN / TEACHER VIEW ─────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fees Management</h1>
        <div className="text-sm text-gray-500">Real-time fee tracking</div>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: stats.total, color: 'bg-purple-50 text-purple-700', icon: '👨‍🎓' },
          { label: 'Total Fees', value: `₹${stats.totalAmt.toLocaleString()}`, color: 'bg-blue-50 text-blue-700', icon: '💰' },
          { label: 'Collected', value: `₹${stats.paidAmt.toLocaleString()}`, color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Pending', value: `₹${stats.pendingAmt.toLocaleString()}`, color: 'bg-red-50 text-red-700', icon: '⏳' },
        ].map((c, i) => (
          <div key={i} className={`${c.color} rounded-xl p-4 border border-opacity-20`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xl font-bold">{c.value}</div>
            <div className="text-xs font-medium mt-1 opacity-70">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Academic Year</label>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e] font-semibold">
            {['2022-23','2023-24','2024-25','2025-26','2026-27'].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]">
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Section</label>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]">
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fee Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]">
            {['All', 'Paid', 'Partial', 'Pending', 'Not Set'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => { setFilterClass(''); setFilterSection(''); setFilterStatus('All'); setFilterYear(String(new Date().getFullYear())); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          Reset
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-[#5e3a9e] bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg">
          <span>📅</span>
          <span>Annual Fees — FY {filterYear}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#5e3a9e] border-t-transparent rounded-full animate-spin" /></div>
        ) : feesList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💳</div>
            <p className="font-medium">No fee records found</p>
            <p className="text-sm mt-1">Adjust filters or admit students to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['#', 'Student Name', 'Class', 'Section', 'Total Fees', 'Paid', 'Pending', 'Status', 'Due Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feesList.map((fee, idx) => (
                  <tr key={fee.studentId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{fee.studentName}</td>
                    <td className="px-4 py-3 text-gray-600">{fee.class}</td>
                    <td className="px-4 py-3 text-gray-600">{fee.section}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">₹{Number(fee.totalFees || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">₹{Number(fee.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">₹{Number(fee.pendingAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(fee.status)}`}>
                        {fee.status === 'Partial' ? `Partial (₹${Number(fee.pendingAmount).toLocaleString()} Pending)` : fee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {fee.status === 'Paid' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-200 cursor-default">
                            ✓ Fully Paid
                          </span>
                        ) : (
                          <button onClick={() => openCollect(fee)} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition font-bold shadow-sm">
                            {fee.status === 'Partial' ? 'Collect Remaining' : 'Collect Fee'}
                          </button>
                        )}
                        <button onClick={() => openEdit(fee)} className="px-2 py-1 bg-[#5e3a9e]/10 text-[#5e3a9e] rounded text-xs hover:bg-[#5e3a9e]/20 transition font-medium">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingFee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit Fees — {editingFee.studentName}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{editingFee.class} {editingFee.section}</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Annual Fees (₹)</label>
                <input type="number" value={editForm.totalFees} onChange={e => setEditForm(f => ({ ...f, totalFees: e.target.value }))} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]" placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                <input type="number" value={editForm.paidAmount} onChange={e => setEditForm(f => ({ ...f, paidAmount: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]" placeholder="0" />
              </div>
              {editForm.totalFees && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  Pending: ₹{Math.max(0, Number(editForm.totalFees) - Number(editForm.paidAmount || 0)).toLocaleString()}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
                  {['Pending', 'Partial', 'Paid'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 py-2 bg-[#5e3a9e] text-white rounded-lg text-sm font-medium hover:bg-[#4c2d8a] transition disabled:opacity-60">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showCollectModal && collectingFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-[#5e3a9e] text-white">
              <h3 className="text-lg font-bold">Collect Student Fee Payment</h3>
              <p className="text-xs text-purple-200 mt-0.5">{collectingFor.studentName} — Class {collectingFor.class} ({collectingFor.section})</p>
            </div>
            <form onSubmit={handleCollectSubmit} className="p-6 space-y-4">
              {/* Fee Breakdown Card */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Annual Fees</span>
                  <span className="font-bold text-gray-900">₹{Number(collectingFor.totalFees).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Already Collected</span>
                  <span className="font-bold text-emerald-700">₹{Number(collectingFor.paidAmount).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-xs font-bold">
                  <span className="text-gray-700">Remaining Balance</span>
                  <span className="text-rose-600">₹{Number(collectingFor.pendingAmount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount Collected (₹) *</label>
                <input 
                  type="number" 
                  value={collectForm.amount} 
                  onChange={e => {
                    const val = Number(e.target.value);
                    const maxPayable = Number(collectingFor.pendingAmount || 0);
                    setCollectForm(f => ({ ...f, amount: maxPayable > 0 ? String(Math.min(val, maxPayable)) : e.target.value }));
                  }} 
                  required 
                  min="1" 
                  max={collectingFor.pendingAmount}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none font-bold" 
                  placeholder="Enter amount to collect" 
                />
                <p className="text-[10px] text-gray-400 mt-1">Max collectable: ₹{Number(collectingFor.pendingAmount).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select value={collectForm.paymentMode} onChange={e => setCollectForm(f => ({ ...f, paymentMode: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select value={collectForm.month} onChange={e => setCollectForm(f => ({ ...f, month: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select value={collectForm.year} onChange={e => setCollectForm(f => ({ ...f, year: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
                    {['2023','2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input type="text" value={collectForm.remarks} onChange={e => setCollectForm(f => ({ ...f, remarks: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]" placeholder="Optional note" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCollectModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={collectLoading} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60">
                  {collectLoading ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
