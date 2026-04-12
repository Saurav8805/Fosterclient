'use client';

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

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
    
    if (!mobile || !role) {
      router.push('/login')
      return
    }

    setUserRole(Number(role))
    setUserName(mobile)

    // Load saved profile data
    const savedData = localStorage.getItem('profileData')
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }

    const savedImage = localStorage.getItem('profileImage')
    if (savedImage) {
      setProfileImage(savedImage)
    }
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('profileData', JSON.stringify(formData))
    alert('Profile updated successfully!')
  }

  if (userRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const roleName = userRole === 8 ? 'Administrator' : userRole === 6 ? 'Faculty' : 'Student'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Click to upload photo</p>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900">{formData.fullName || 'Complete Your Profile'}</h2>
                <p className="text-lg text-gray-600 mt-1">{roleName}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📱</span>
                    <span>{userName}</span>
                  </div>
                  {formData.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span>{formData.email}</span>
                    </div>
                  )}
                  {formData.bloodGroup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🩸</span>
                      <span>{formData.bloodGroup}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
              />
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                placeholder="e.g., A+, B-, O+"
              />
              <Input
                label="Emergency Contact"
                name="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Address Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                />
              </div>
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
              />
              <Input
                label="PIN Code"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="PIN Code"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
