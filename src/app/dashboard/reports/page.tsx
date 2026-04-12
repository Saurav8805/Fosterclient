'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function ReportsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Student (role 19): view own progress & report card
  if (userRole === 19) {
    const subjectProgress = [
      { subject: 'Mathematics', marks: 85, total: 100, grade: 'A', percentage: 85 },
      { subject: 'Science', marks: 78, total: 100, grade: 'B+', percentage: 78 },
      { subject: 'English', marks: 92, total: 100, grade: 'A+', percentage: 92 },
      { subject: 'History', marks: 75, total: 100, grade: 'B', percentage: 75 },
      { subject: 'Geography', marks: 88, total: 100, grade: 'A', percentage: 88 },
    ]
    const overallPercentage = subjectProgress.reduce((acc, curr) => acc + curr.percentage, 0) / subjectProgress.length

    const gradeStyle = (p: number) =>
      p >= 80 ? { bar: 'bg-green-600', badge: 'bg-green-100 text-green-800', card: 'bg-green-50', text: 'text-green-700' } :
      p >= 60 ? { bar: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800', card: 'bg-blue-50', text: 'text-blue-700' } :
      p >= 40 ? { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800', card: 'bg-yellow-50', text: 'text-yellow-700' } :
               { bar: 'bg-red-600', badge: 'bg-red-100 text-red-800', card: 'bg-red-50', text: 'text-red-700' }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Progress & Reports</h1>
          <Button onClick={() => alert('Report card download functionality will be implemented with backend integration.')} variant="primary">
            Download Report Card
          </Button>
        </div>
        <Card className="mb-6">
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Overall Performance</h3></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20"
                    strokeDasharray={`${(overallPercentage / 100) * 502.4} 502.4`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{overallPercentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Overall</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {[
                  { label: 'Excellent', fn: (p: number) => p >= 80, cls: 'bg-green-50 text-green-600' },
                  { label: 'Good', fn: (p: number) => p >= 60 && p < 80, cls: 'bg-blue-50 text-blue-600' },
                  { label: 'Average', fn: (p: number) => p >= 40 && p < 60, cls: 'bg-yellow-50 text-yellow-600' },
                  { label: 'Needs Improvement', fn: (p: number) => p < 40, cls: 'bg-red-50 text-red-600' },
                ].map((cat) => (
                  <div key={cat.label} className={`text-center p-4 rounded-lg ${cat.cls.split(' ')[0]}`}>
                    <p className={`text-2xl font-bold ${cat.cls.split(' ')[1]}`}>{subjectProgress.filter(s => cat.fn(s.percentage)).length}</p>
                    <p className="text-sm text-gray-600">{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Subject-wise Performance</h3></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectProgress.map((s, i) => {
                const c = gradeStyle(s.percentage)
                return (
                  <div key={i} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{s.subject}</p>
                        <p className="text-sm text-gray-600">{s.marks}/{s.total} marks</p>
                      </div>
                      <span className={`px-4 py-2 rounded-lg font-bold text-lg ${c.card} ${c.text}`}>{s.grade}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`${c.bar} h-3 rounded-full`} style={{ width: `${s.percentage}%` }} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 text-right">{s.percentage}%</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Report Card Summary</h3></CardHeader>
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
                  {subjectProgress.map((s, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{s.subject}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{s.marks}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{s.total}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{s.percentage}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${gradeStyle(s.percentage).badge}`}>{s.grade}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4 text-sm text-gray-900">Overall</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subjectProgress.reduce((a, c) => a + c.marks, 0)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subjectProgress.reduce((a, c) => a + c.total, 0)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{overallPercentage.toFixed(1)}%</td>
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
    )
  }

  // Faculty (role 6) and Admin (role 8): all student reports
  const reports = [
    { id: 1, student: 'Alice Johnson', class: 'Nursery', term: 'Term 1', grade: 'A', percentage: 92 },
    { id: 2, student: 'Bob Williams', class: 'LKG', term: 'Term 1', grade: 'B+', percentage: 85 },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Progress & Report Cards</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Student Reports</h2>
            <button className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition">Generate Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{rep.student}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{rep.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{rep.term}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{rep.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{rep.percentage}%</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">View</button>
                      <button className="text-[#5e3a9e] hover:underline mr-3">Download</button>
                      <button className="text-[#5e3a9e] hover:underline">Print</button>
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
