'use client';

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

export default function ProfilePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    bloodGroup: '',
    class: '',
    section: '',
    rollNo: '',
    mobile: '',
    teacherName: ''
  })

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const id = localStorage.getItem('userId')
    if (!role || !id) { 
      router.push('/login')
      return 
    }
    setUserRole(Number(role))
    setUserId(id)
    fetchProfileData(id)
    
    // Load saved profile image
    const savedImage = localStorage.getItem('profileImage')
    if (savedImage) setProfileImage(savedImage)
  }, [router])

  const fetchProfileData = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/profile?userId=${id}`)
      const result = await response.json()

      if (result.success) {
        const user = result.user
        const additional = user.additionalData

        setFormData({
          fullName: user.full_name || '',
          email: user.email || '',
          mobile: user.mobile || '',
          dateOfBirth: additional?.dob || '',
          address: additional?.address || '',
          city: additional?.city || '',
          state: additional?.state || '',
          pincode: additional?.pincode || '',
          emergencyContact: additional?.emergency_contact || '',
          bloodGroup: additional?.blood_group || '',
          class: additional?.class || '',
          section: additional?.section || '',
          rollNo: additional?.roll_no || '',
          teacherName: additional?.teacher?.full_name || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileImage(result)
        localStorage.setItem('profileImage', result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19
  const roleName = userRole === 8 ? 'Administrator' : userRole === 6 ? 'Faculty' : 'Student'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-200">
                    {formData.fullName.charAt(0) || 'U'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Click to change photo</p>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900">{formData.fullName || 'Complete Your Profile'}</h2>
              <p className="text-lg text-gray-500 mt-1">{roleName}</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-6-3.75H6m.75 3.75H6" />
                  </svg>
                  <span>{formData.mobile}</span>
                </div>
                {formData.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Student Information — read-only for students */}
      {isStudent && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Student Information</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Read only</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.fullName || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Mobile Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.mobile}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.email || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Date of Birth</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Blood Group</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.bloodGroup || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Emergency Contact</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.emergencyContact || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Class Enrolled</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.class || 'Not assigned'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Section</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.section || 'Not assigned'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Roll Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.rollNo || 'Not assigned'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Assigned Teacher</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.teacherName || 'Not assigned'}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 block mb-1">Address</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.address || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">City</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.city || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">State</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.state || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Pincode</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {formData.pincode || 'Not provided'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
