'use client';

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { usersApi } from '@/lib/api'

// Import only needed icons to reduce bundle size
import {
  User, Mail, Phone, Calendar, MapPin, Droplet, 
  Users, BookOpen, Hash, Briefcase, Building2, 
  DollarSign, UserCircle
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [studentData, setStudentData] = useState({
    fullName: '', mobile: '', email: '', studentName: '', class: '', section: '',
    rollNo: '', dob: '', age: '', gender: '', admissionDate: '', aadharNumber: '',
    bloodGroup: '', parentName: '', motherName: '', address: '', city: '', state: '',
    pincode: '', emergencyContact: '', teacherName: '', createdAt: ''
  })

  const [staffData, setStaffData] = useState({
    fullName: '', mobile: '', email: '', designation: '', department: '',
    joiningDate: '', salary: '', createdAt: ''
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Edit Profile modal state (for Staff / Teachers / Principal)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [editProfileData, setEditProfileData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    department: '',
    designation: ''
  })
  const [editProfileLoading, setEditProfileLoading] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const id = localStorage.getItem('userId')
    if (!role || !id) { 
      router.push('/login')
      return 
    }
    setUserRole(Number(role))
    setUserId(id)
    fetchProfileData(id, Number(role))
    const savedImage = localStorage.getItem(`profileImage_${id}`)
    if (savedImage) setProfileImage(savedImage)
  }, [])

  const fetchProfileData = async (id: string, role: number) => {
    try {
      setLoading(true)
      const result = await usersApi.getProfile(id)
      if (result.success) {
        const userData = result.data.user
        const additional = result.data.additionalData
        if (role === 19) {
          setStudentData({
            fullName: userData.full_name || '', mobile: userData.mobile || '', email: userData.email || '',
            studentName: additional?.student_name || userData.full_name || '', class: additional?.class || '',
            section: additional?.section || '', rollNo: additional?.roll_no || '', dob: additional?.dob || '',
            age: additional?.age || '', gender: additional?.gender || '', admissionDate: additional?.admission_date || '',
            aadharNumber: additional?.aadhar_number || '', bloodGroup: additional?.blood_group || '',
            parentName: additional?.parent_name || '', motherName: additional?.mother_name || '',
            address: additional?.address || '', city: additional?.city || '', state: additional?.state || '',
            pincode: additional?.pincode || '', emergencyContact: additional?.emergency_contact || '',
            teacherName: additional?.teacher?.full_name || '', createdAt: userData.created_at || ''
          })
        } else {
          setStaffData({
            fullName: userData.full_name || '', mobile: userData.mobile || '', email: userData.email || '',
            designation: additional?.designation || '', department: additional?.department || '',
            joiningDate: additional?.joining_date || '', salary: additional?.salary || '',
            createdAt: userData.created_at || ''
          })
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load profile data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'Image size must be less than 5MB' }); return }
      if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Please upload an image file' }); return }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileImage(result)
        localStorage.setItem(`profileImage_${userId}`, result)
        setMessage({ type: 'success', text: 'Profile photo updated!' })
        setTimeout(() => setMessage(null), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return null
  }

  const isStudent = userRole === 19
  const isStaff = userRole === 6 || userRole === 7 || userRole === 8
  const getRoleName = (role: number) => {
    switch(role) {
      case 6: return 'Principal/Vice-Principal'
      case 7: return 'Teacher'
      case 8: return 'Support Staff'
      case 19: return 'Student'
      default: return 'User'
    }
  }
  const currentData = isStudent ? studentData : staffData
  const displayName = isStudent ? studentData.fullName || studentData.studentName : staffData.fullName
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: '❌ New password and confirm password do not match.' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: '❌ New password must be at least 6 characters long.' })
      return
    }

    setPasswordLoading(true)
    setPasswordMessage(null)

    try {
      const result = await usersApi.changePassword({
        userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (result.success) {
        setPasswordMessage({ type: 'success', text: '✅ Password changed successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: `❌ ${result.error || 'Failed to change password'}` })
      }
    } catch (err) {
      console.error('Password change error:', err)
      setPasswordMessage({ type: 'error', text: '❌ Failed to change password. Please check your current password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleOpenEditProfile = () => {
    setEditProfileData({
      fullName: staffData.fullName || '',
      email: staffData.email || '',
      mobile: staffData.mobile || '',
      department: staffData.department || '',
      designation: staffData.designation || ''
    })
    setShowEditProfileModal(true)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setEditProfileLoading(true)
    try {
      const res = await usersApi.updateProfile(userId, editProfileData)
      if (res.success) {
        setMessage({ type: 'success', text: '✅ Profile updated successfully!' })
        if (editProfileData.fullName) localStorage.setItem('userName', editProfileData.fullName)
        if (editProfileData.mobile) localStorage.setItem('userMobile', editProfileData.mobile)
        setShowEditProfileModal(false)
        fetchProfileData(userId, userRole!)
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: `❌ ${res.error || 'Failed to update profile'}` })
      }
    } catch (err) {
      console.error('Update profile error:', err)
      setMessage({ type: 'error', text: '❌ Failed to update profile.' })
    } finally {
      setEditProfileLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-neutral-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
          <p className="text-sm text-neutral-600 mt-1">View your personal information and update settings</p>
        </div>
        {isStaff && (
          <button
            onClick={handleOpenEditProfile}
            className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-400 rounded-lg hover:bg-blue-100 font-medium text-sm transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <span>{message.text}</span>
        </div>
      )}
      <Card className="mb-6 shadow-sm border border-neutral-200">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-neutral-200 shadow-lg"/>
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-neutral-200 shadow-lg">{initials}</div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white text-blue-600 border-2 border-blue-500 p-2.5 rounded-full hover:bg-blue-50 transition shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <p className="text-xs text-neutral-500">Click to change</p>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-neutral-900">{displayName || 'User'}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200 mt-2">
                <UserCircle className="w-4 h-4" />{getRoleName(userRole!)}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Phone className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-xs text-neutral-500">Mobile</p><p className="font-semibold">{currentData.mobile || 'N/A'}</p></div>
                </div>
                {currentData.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><Mail className="w-5 h-5 text-green-600" /></div>
                    <div><p className="text-xs text-neutral-500">Email</p><p className="font-semibold text-sm">{currentData.email}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader className="bg-neutral-50"><h3 className="font-semibold flex items-center gap-2"><User className="w-5 h-5 text-blue-600"/>Personal</h3></CardHeader>
            <CardContent className="p-4 space-y-3">
              <div><p className="text-xs text-neutral-500">Name</p><p className="font-medium">{studentData.studentName || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">DOB</p><p className="font-medium">{studentData.dob ? new Date(studentData.dob).toLocaleDateString('en-IN') : 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Age</p><p className="font-medium">{studentData.age || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Gender</p><p className="font-medium">{studentData.gender || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Blood Group</p><p className="font-medium">{studentData.bloodGroup || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Aadhar</p><p className="font-medium">{studentData.aadharNumber || 'N/A'}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader className="bg-neutral-50"><h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600"/>Academic</h3></CardHeader>
            <CardContent className="p-4 space-y-3">
              <div><p className="text-xs text-neutral-500">Class</p><p className="font-medium">{studentData.class || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Section</p><p className="font-medium">{studentData.section || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Roll No</p><p className="font-medium">{studentData.rollNo || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Teacher</p><p className="font-medium">{studentData.teacherName || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Admission Date</p><p className="font-medium">{studentData.admissionDate ? new Date(studentData.admissionDate).toLocaleDateString('en-IN') : 'N/A'}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader className="bg-neutral-50"><h3 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/>Parents</h3></CardHeader>
            <CardContent className="p-4 space-y-3">
              <div><p className="text-xs text-neutral-500">Father</p><p className="font-medium">{studentData.parentName || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Mother</p><p className="font-medium">{studentData.motherName || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Emergency</p><p className="font-medium">{studentData.emergencyContact || 'N/A'}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader className="bg-neutral-50"><h3 className="font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600"/>Address</h3></CardHeader>
            <CardContent className="p-4 space-y-3">
              <div><p className="text-xs text-neutral-500">Address</p><p className="font-medium">{studentData.address || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">City</p><p className="font-medium">{studentData.city || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">State</p><p className="font-medium">{studentData.state || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Pincode</p><p className="font-medium">{studentData.pincode || 'N/A'}</p></div>
            </CardContent>
          </Card>
        </div>
      )}
      {isStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader className="bg-neutral-50"><h3 className="font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600"/>Professional</h3></CardHeader>
            <CardContent className="p-4 space-y-3">
              <div><p className="text-xs text-neutral-500">Designation</p><p className="font-medium">{staffData.designation || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Department</p><p className="font-medium">{staffData.department || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Joining Date</p><p className="font-medium">{staffData.joiningDate ? new Date(staffData.joiningDate).toLocaleDateString('en-IN') : 'N/A'}</p></div>
              {userRole === 6 && staffData.salary && (
                <div><p className="text-xs text-neutral-500">Salary</p><p className="font-medium">₹{Number(staffData.salary).toLocaleString('en-IN')}</p></div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader className="bg-neutral-50"><h3 className="font-semibold flex items-center gap-2"><Phone className="w-5 h-5 text-blue-600"/>Contact</h3></CardHeader>
            <CardContent className="p-4 space-y-3">
              <div><p className="text-xs text-neutral-500">Mobile</p><p className="font-medium">{staffData.mobile || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500">Email</p><p className="font-medium">{staffData.email || 'N/A'}</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Reset Section */}
      <Card className="shadow-sm border border-neutral-200">
        <CardHeader className="bg-neutral-50">
          <h3 className="font-semibold flex items-center gap-2 text-neutral-900">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security & Change Password
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          {passwordMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              passwordMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="max-w-xl space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700 text-xs font-semibold"
                >
                  {showCurrentPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700 text-xs font-semibold"
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700 text-xs font-semibold"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-4 px-5 py-2.5 bg-blue-50 text-blue-700 border-2 border-blue-400 rounded-lg hover:bg-blue-100 font-medium text-sm transition disabled:opacity-50"
            >
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Profile Modal (for Staff / Teachers / Principal) */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-blue-600" />
                Edit Profile Information
              </h3>
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={editProfileData.fullName}
                  onChange={(e) => setEditProfileData({ ...editProfileData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (Username) *</label>
                <input 
                  type="text" 
                  required
                  value={editProfileData.mobile}
                  onChange={(e) => setEditProfileData({ ...editProfileData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editProfileData.email}
                  onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. teacher@school.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                  type="text" 
                  value={editProfileData.department}
                  onChange={(e) => setEditProfileData({ ...editProfileData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Teaching, Academics, Admin"
                />
              </div>

              {userRole === 6 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input 
                    type="text" 
                    value={editProfileData.designation}
                    onChange={(e) => setEditProfileData({ ...editProfileData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Principal / Vice-Principal"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editProfileLoading}
                  className="px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {editProfileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
