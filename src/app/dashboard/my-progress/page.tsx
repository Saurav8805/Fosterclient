'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MyProgressPage() {
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

  // Sample progress data
  const subjectProgress = [
    { subject: 'Mathematics', marks: 85, total: 100, grade: 'A', percentage: 85 },
    { subject: 'Science', marks: 78, total: 100, grade: 'B+', percentage: 78 },
    { subject: 'English', marks: 92, total: 100, grade: 'A+', percentage: 92 },
    { subject: 'History', marks: 75, total: 100, grade: 'B', percentage: 75 },
    { subject: 'Geography', marks: 88, total: 100, grade: 'A', percentage: 88 },
  ];

  const overallPercentage = subjectProgress.reduce((acc, curr) => acc + curr.percentage, 0) / subjectProgress.length;

  const handleDownloadReport = () => {
    alert('Report card download functionality will be implemented with backend integration.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Progress & Reports</h1>
        <Button onClick={handleDownloadReport} variant="primary">
          📥 Download Report Card
        </Button>
      </div>

      {/* Overall Performance */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Overall Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Pie Chart Representation */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray={`${(overallPercentage / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{overallPercentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Overall</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{subjectProgress.filter(s => s.percentage >= 80).length}</p>
                <p className="text-sm text-gray-600">Excellent</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{subjectProgress.filter(s => s.percentage >= 60 && s.percentage < 80).length}</p>
                <p className="text-sm text-gray-600">Good</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{subjectProgress.filter(s => s.percentage >= 40 && s.percentage < 60).length}</p>
                <p className="text-sm text-gray-600">Average</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{subjectProgress.filter(s => s.percentage < 40).length}</p>
                <p className="text-sm text-gray-600">Needs Improvement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Progress */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Subject-wise Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectProgress.map((subject, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{subject.subject}</p>
                    <p className="text-sm text-gray-600">{subject.marks}/{subject.total} marks</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg font-bold text-lg ${
                    subject.percentage >= 80 ? 'bg-green-100 text-green-700' :
                    subject.percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                    subject.percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {subject.grade}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      subject.percentage >= 80 ? 'bg-green-600' :
                      subject.percentage >= 60 ? 'bg-blue-600' :
                      subject.percentage >= 40 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${subject.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right">{subject.percentage}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Card Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Report Card Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subject</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Marks Obtained</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Marks</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Percentage</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectProgress.map((subject, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{subject.subject}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subject.marks}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subject.total}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subject.percentage}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        subject.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        subject.percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                        subject.percentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subject.grade}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-3 px-4 text-sm text-gray-900">Overall</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-center">
                    {subjectProgress.reduce((acc, curr) => acc + curr.marks, 0)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-center">
                    {subjectProgress.reduce((acc, curr) => acc + curr.total, 0)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-center">
                    {overallPercentage.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {overallPercentage >= 80 ? 'A' : overallPercentage >= 60 ? 'B' : overallPercentage >= 40 ? 'C' : 'D'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
