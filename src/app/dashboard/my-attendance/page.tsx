'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function MyAttendancePage() {
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

  // Sample attendance data
  const attendanceData = {
    totalDays: 180,
    present: 165,
    absent: 10,
    leave: 5,
    percentage: 91.67
  };

  const recentAttendance = [
    { date: '2024-01-15', status: 'Present', subject: 'Mathematics' },
    { date: '2024-01-14', status: 'Present', subject: 'Science' },
    { date: '2024-01-13', status: 'Absent', subject: 'English' },
    { date: '2024-01-12', status: 'Present', subject: 'History' },
    { date: '2024-01-11', status: 'Present', subject: 'Geography' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Attendance</h1>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Days</p>
              <p className="text-3xl font-bold text-gray-900">{attendanceData.totalDays}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Present</p>
              <p className="text-3xl font-bold text-green-600">{attendanceData.present}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Absent</p>
              <p className="text-3xl font-bold text-red-600">{attendanceData.absent}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Attendance %</p>
              <p className="text-3xl font-bold text-blue-600">{attendanceData.percentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Progress Bar */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Attendance Overview</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Present</span>
                <span className="text-sm font-medium text-gray-700">{attendanceData.present}/{attendanceData.totalDays}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${(attendanceData.present / attendanceData.totalDays) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Absent</span>
                <span className="text-sm font-medium text-gray-700">{attendanceData.absent}/{attendanceData.totalDays}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full" 
                  style={{ width: `${(attendanceData.absent / attendanceData.totalDays) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Leave</span>
                <span className="text-sm font-medium text-gray-700">{attendanceData.leave}/{attendanceData.totalDays}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-600 h-3 rounded-full" 
                  style={{ width: `${(attendanceData.leave / attendanceData.totalDays) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Recent Attendance</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{record.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{record.subject}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'Present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
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
