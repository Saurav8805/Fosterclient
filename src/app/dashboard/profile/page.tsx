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

  return (
    <div className="p-6 max-w-7xl mx-auto bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        <p className="text-sm text-neutral-600 mt-1">View your personal information</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  )
}
