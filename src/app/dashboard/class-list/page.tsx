'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { configApi } from '@/lib/api'

interface ClassStats {
  name: string
  studentCount: number
  sections: string[]
  teachers: string[]
}

export default function ClassListPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassStats()
  }, [])

  const fetchClassStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await configApi.getClassStats()
      
      if (result.success) {
        setClasses(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch class statistics')
      }
    } catch (err: any) {
      console.error('Failed to fetch class stats:', err)
      setError(err.message || 'Failed to fetch class statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Class List</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Classes ({classes.length})</h2>
          </div>

          {classes.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No classes found</p>
              <p className="text-gray-500 text-sm">Classes will appear here once students are admitted</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {classes.map((cls, index) => (
                <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-[#5e3a9e] mb-2">{cls.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Students:</span> {cls.studentCount}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Sections:</span> {cls.sections.length > 0 ? cls.sections.join(', ') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Teachers:</span> {cls.teachers.length > 0 ? cls.teachers.join(', ') : 'Not assigned'}
                  </p>
                  <button 
                    onClick={() => router.push(`/dashboard/student-list?class=${cls.name}`)}
                    className="text-[#5e3a9e] hover:underline text-sm font-medium"
                  >
                    View Students →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
