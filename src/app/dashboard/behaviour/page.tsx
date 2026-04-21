'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface BehaviourRecord {
  id: string
  rating: number
  comment: string
  date: string
  teacher: {
    full_name: string
  }
}

interface BehaviourData {
  records: BehaviourRecord[]
  overallRating: number
}

export default function BehaviourPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [behaviourData, setBehaviourData] = useState<BehaviourData | null>(null)
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
      fetchBehaviourData()
    } else if (userRole !== null) {
      setLoading(false)
    }
  }, [userRole, userId])

  const fetchBehaviourData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/behaviour/my-behaviour?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setBehaviourData(result.data)
      } else {
        setError('No behaviour data found')
      }
    } catch (err) {
      console.error('Error fetching behaviour:', err)
      setError('Failed to load behaviour data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  // Student (role 19): view own behaviour
  if (userRole === 19) {
    if (error || !behaviourData || behaviourData.records.length === 0) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Behaviour</h1>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">{error || 'No behaviour records available yet'}</p>
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

    const getRatingColor = (r: number) => r >= 4.5 ? 'text-green-600' : r >= 3.5 ? 'text-blue-600' : r >= 2.5 ? 'text-yellow-600' : 'text-red-600'
    const getRatingBg = (r: number) => r >= 4.5 ? 'bg-green-100' : r >= 3.5 ? 'bg-blue-100' : r >= 2.5 ? 'bg-yellow-100' : 'bg-red-100'

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Behaviour</h1>
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Overall Behaviour Rating</p>
            <p className={`text-6xl font-bold ${getRatingColor(behaviourData.overallRating)}`}>{behaviourData.overallRating}/5</p>
            <div className="flex justify-center mt-4">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={`text-3xl ${s <= behaviourData.overallRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">Based on {behaviourData.records.length} teacher {behaviourData.records.length === 1 ? 'review' : 'reviews'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="text-xl font-semibold text-gray-900">Teacher Comments</h3></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behaviourData.records.map((rec, i) => (
                <div key={rec.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{rec.teacher.full_name}</p>
                      <p className="text-sm text-gray-600">{formatDate(rec.date)}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRatingBg(rec.rating)} ${getRatingColor(rec.rating)}`}>
                      {rec.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{rec.comment}"</p>
                  <div className="flex mt-2">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-lg ${s <= rec.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Faculty (role 6) and Admin (role 8): manage student behaviour
  const [students, setStudents] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (userRole === 6 || userRole === 8) {
      fetchStudents()
    }
  }, [userRole])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/behaviour/add')
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

  const handleAddComment = (student: any) => {
    setSelectedStudent(student)
    setFormData({
      rating: 5,
      comment: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !userId) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/behaviour/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          teacherId: userId,
          rating: formData.rating,
          comment: formData.comment,
          date: formData.date
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Behaviour comment added successfully!' })
        setShowModal(false)
        fetchStudents()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add comment' })
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      setMessage({ type: 'error', text: 'Failed to add comment. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Behaviour</h1>

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
          <h3 className="text-xl font-semibold text-gray-900">Behaviour Records</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
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
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.user?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.roll_no || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {student.averageRating > 0 ? student.averageRating : 'N/A'}
                          </span>
                          {student.averageRating > 0 && (
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <span key={s} className={`text-sm ${s <= student.averageRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.behaviour?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => handleAddComment(student)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Add Comment
                        </button>
                      </td>
                    </tr>
                  ))
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
              <h3 className="text-xl font-semibold text-gray-900">Add Behaviour Comment</h3>
              <p className="text-sm text-gray-600 mt-1">
                Student: {selectedStudent.user?.full_name} ({selectedStudent.class})
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: r })}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold transition ${
                        formData.rating === r 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-2xl ${s <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Enter your comment about the student's behaviour..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                  {saving ? 'Saving...' : 'Save Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
