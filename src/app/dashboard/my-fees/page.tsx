'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function MyFeesPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
      return;
    }
    setUserRole(Number(role));
  }, [router]);

  if (userRole === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Sample fees data
  const feesData = {
    totalFees: 50000,
    paidAmount: 35000,
    pendingAmount: 15000,
    dueDate: '2024-02-28'
  };

  const feeHistory = [
    { date: '2024-01-10', description: 'Tuition Fee - Term 1', amount: 15000, status: 'Paid', receipt: 'RCP001' },
    { date: '2023-12-15', description: 'Exam Fee', amount: 2000, status: 'Paid', receipt: 'RCP002' },
    { date: '2023-11-20', description: 'Library Fee', amount: 1000, status: 'Paid', receipt: 'RCP003' },
    { date: '2023-10-10', description: 'Tuition Fee - Term 2', amount: 15000, status: 'Paid', receipt: 'RCP004' },
    { date: '2024-02-28', description: 'Tuition Fee - Term 3', amount: 15000, status: 'Pending', receipt: '-' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Fees Status</h1>

      {/* Fees Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Fees</p>
              <p className="text-3xl font-bold text-gray-900">₹{feesData.totalFees.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Paid Amount</p>
              <p className="text-3xl font-bold text-green-600">₹{feesData.paidAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Pending Amount</p>
              <p className="text-3xl font-bold text-red-600">₹{feesData.pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Progress */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Payment Progress</h3>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Paid: ₹{feesData.paidAmount.toLocaleString()}</span>
              <span className="text-sm font-medium text-gray-700">{((feesData.paidAmount / feesData.totalFees) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all" 
                style={{ width: `${(feesData.paidAmount / feesData.totalFees) * 100}%` }}
              ></div>
            </div>
          </div>
          {feesData.pendingAmount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Due Date:</span> {feesData.dueDate}
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                Please pay the pending amount of ₹{feesData.pendingAmount.toLocaleString()} before the due date.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee History */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{record.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{record.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">₹{record.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{record.receipt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
