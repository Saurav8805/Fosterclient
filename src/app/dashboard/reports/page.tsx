'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProgressRecord {
  id: string
  subject: string
  marks: number
  total_marks: number
  grade: string
  percentage: number
}

interface ProgressData {
  records: ProgressRecord[]
  overallPercentage: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
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
      fetchProgressData()
    } else if (userRole !== null) {
      setLoading(false)
    }
  }, [userRole, userId])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/progress/my-progress?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setProgressData(result.data)
      } else {
        setError('No progress data found')
      }
    } catch (err) {
      console.error('Error fetching progress:', err)
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Student (role 19): view own progress & report card
  if (userRole === 19) {
    if (error || !progressData || progressData.records.length === 0) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Progress & Reports</h1>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">{error || 'No progress records available yet'}</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const subjectProgress = progressData.records
    const overallPercentage = progressData.overallPercentage

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
                  <div key={s.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{s.subject}</p>
                        <p className="text-sm text-gray-600">{s.marks}/{s.total_marks} marks</p>
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
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{s.subject}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{s.marks}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{s.total_marks}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{s.percentage}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${gradeStyle(s.percentage).badge}`}>{s.grade}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4 text-sm text-gray-900">Overall</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subjectProgress.reduce((a, c) => a + c.marks, 0)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{subjectProgress.reduce((a, c) => a + c.total_marks, 0)}</td>
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

  // Faculty (role 6) and Admin (role 8): manage student progress
  const [students, setStudents] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    subject: '',
    marks: '',
    totalMarks: ''
  })

  useEffect(() => {
    if (userRole === 6 || userRole === 8) {
      fetchStudents()
    }
  }, [userRole])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/progress/add')
      const result = await response.json()

      if (result.success) {
        setStudents(result.data)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setMessage({ type: 'error', text: 'Failed to load students' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMarks = (student: any) => {
    setSelectedStudent(student)
    setFormData({
      subject: '',
      marks: '',
      totalMarks: ''
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/progress/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          subject: formData.subject,
          marks: parseFloat(formData.marks),
          totalMarks: parseFloat(formData.totalMarks)
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setShowModal(false)
        fetchStudents()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add marks' })
      }
    } catch (error) {
      console.error('Failed to add marks:', error)
      setMessage({ type: 'error', text: 'Failed to add marks. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Progress & Report Cards</h1>

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
          <h3 className="text-xl font-semibold text-gray-900">Student Reports</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const avgPercentage = student.averagePercentage || 0
                    const gradeColor = avgPercentage >= 80 ? 'bg-green-100 text-green-800' :
                                      avgPercentage >= 60 ? 'bg-blue-100 text-blue-800' :
                                      avgPercentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{student.user?.full_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.class || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.roll_no || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {avgPercentage > 0 ? (
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${gradeColor}`}>
                              {avgPercentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {student.progress?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => handleAddMarks(student)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Add Marks
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add Marks</h3>
              <p className="text-sm text-gray-600 mt-1">
                Student: {selectedStudent.user?.full_name} ({selectedStudent.class})
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Art & Craft">Art & Craft</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Music">Music</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks Obtained
                </label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  placeholder="e.g., 85"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  placeholder="e.g., 100"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {formData.marks && formData.totalMarks && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Percentage: <span className="font-semibold text-blue-600">
                      {((parseFloat(formData.marks) / parseFloat(formData.totalMarks)) * 100).toFixed(2)}%
                    </span>
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
                  {saving ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
