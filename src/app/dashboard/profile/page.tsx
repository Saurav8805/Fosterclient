'use client';

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

// Academic fields are read-only for students
const academicInfo = {
  classEnrolled: 'Nursery A',
  teacherAlloted: 'Ms. Sarah Johnson',
  rollNumber: '001',
  admissionNo: 'ADM2024001',
  academicYear: '2024-25',
  section: 'A',
}

export default function ProfilePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    bloodGroup: ''
  })

  useEffect(() => {
    const mobile = localStorage.getItem('userMobile')
    const role = localStorage.getItem('userRole')
    if (!mobile || !role) { router.push('/login'); return }
    setUserRole(Number(role))
    setUserName(mobile)
    const savedData = localStorage.getItem('profileData')
    if (savedData) setFormData(JSON.parse(savedData))
    const savedImage = localStorage.getItem('profileImage')
    if (savedImage) setProfileImage(savedImage)
  }, [router])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('profileData', JSON.stringify(formData))
    alert('Profile updated successfully!')
  }

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19
  const roleName = userRole === 8 ? 'Administrator' : userRole === 6 ? 'Faculty' : 'Student'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Photo — always editable */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-200">
                      {userName.charAt(0)}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-6-3.75H6m.75 3.75H6" /></svg>
                    <span>{userName}</span>
                  </div>
                  {formData.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      <span>{formData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Info — read-only for students */}
        {isStudent && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Academic Information</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Read only</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Class Enrolled', value: academicInfo.classEnrolled },
                  { label: 'Teacher Alloted', value: academicInfo.teacherAlloted },
                  { label: 'Roll Number', value: academicInfo.rollNumber },
                  { label: 'Admission No.', value: academicInfo.admissionNo },
                  { label: 'Academic Year', value: academicInfo.academicYear },
                  { label: 'Section', value: academicInfo.section },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-sm font-medium text-gray-500 block mb-1">{field.label}</label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 cursor-not-allowed">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information — editable */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" required />
              <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" />
              <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} placeholder="e.g., A+, B-, O+" />
              <Input label="Emergency Contact" name="emergencyContact" type="tel" value={formData.emergencyContact} onChange={handleInputChange} placeholder="Emergency contact number" />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Address Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street address" />
              </div>
              <Input label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
              <Input label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" />
              <Input label="PIN Code" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN Code" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
