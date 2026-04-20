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
  const students = [
    { id: 1, name: 'Alice Johnson', class: 'Nursery', behaviour: 'Excellent', rating: 5 },
    { id: 2, name: 'Bob Williams', class: 'LKG', behaviour: 'Good', rating: 4 },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Student Behaviour</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Behaviour Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Behaviour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${student.behaviour === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{student.behaviour}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < student.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-[#5e3a9e] hover:underline mr-3">Edit</button>
                      <button className="text-[#5e3a9e] hover:underline">View Details</button>
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
