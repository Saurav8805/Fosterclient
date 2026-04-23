'use client';

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AdmitStudentPage() {
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: '',
    studentClass: 'Nursery',
    section: 'A',
    rollNo: '',
    bloodGroup: '',
    parentName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    teacherId: ''
  })

  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [sections, setSections] = useState<string[]>([])
  const [bloodGroups, setBloodGroups] = useState<string[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string, credentials?: any } | null>(null)

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers()
    fetchClasses()
    fetchSections()
    fetchConstants()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      const response = await fetch('/api/students/teachers')
      const result = await response.json()

      if (result.success) {
        setTeachers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    } finally {
      setLoadingTeachers(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/config/classes')
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        setClasses(result.data)
        setFormData(prev => ({ ...prev, studentClass: result.data[0] }))
      } else {
        setClasses(['Nursery', 'LKG', 'UKG']) // Fallback
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      setClasses(['Nursery', 'LKG', 'UKG']) // Fallback
    }
  }

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/config/sections')
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        setSections(result.data)
        setFormData(prev => ({ ...prev, section: result.data[0] }))
      } else {
        setSections(['A', 'B', 'C']) // Fallback
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error)
      setSections(['A', 'B', 'C']) // Fallback
    }
  }

  const fetchConstants = async () => {
    try {
      const response = await fetch('/api/config/constants')
      const result = await response.json()
      if (result.success) {
        setBloodGroups(result.data.bloodGroups)
      }
    } catch (error) {
      console.error('Failed to fetch constants:', error)
      setBloodGroups(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']) // Fallback
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/students/admit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Student admitted successfully!',
          credentials: result.data.credentials
        })
        
        // Trigger refresh in student list page - ENHANCED
        console.log('🚀 Sending refresh signals for new student admission...')
        
        // Method 1: Custom event
        console.log('📡 Dispatching studentAdmitted event')
        window.dispatchEvent(new Event('studentAdmitted'))
        
        // Method 2: LocalStorage event (works across tabs)
        console.log('💾 Setting localStorage refresh signal')
        localStorage.setItem('studentListRefresh', Date.now().toString())
        setTimeout(() => {
          localStorage.removeItem('studentListRefresh')
        }, 2000) // Increased timeout
        
        // Method 3: Broadcast Channel API (modern browsers)
        try {
          console.log('📻 Sending BroadcastChannel message')
          const channel = new BroadcastChannel('student_updates')
          channel.postMessage({ 
            type: 'STUDENT_ADMITTED', 
            timestamp: Date.now(),
            studentName: formData.studentName 
          })
          channel.close()
          console.log('✅ BroadcastChannel message sent successfully')
        } catch (e) {
          console.log('❌ BroadcastChannel not supported:', e)
        }
        
        // Method 4: Force refresh after short delay
        setTimeout(() => {
          console.log('⏰ Sending delayed refresh signal')
          window.dispatchEvent(new CustomEvent('forceStudentRefresh', { 
            detail: { newStudent: formData.studentName } 
          }))
        }, 500)
        
        console.log('✅ All refresh signals sent!')
        
        // Reset form
        setFormData({
          studentName: '',
          dob: '',
          gender: '',
          studentClass: classes[0] || 'Nursery',
          section: sections[0] || 'A',
          rollNo: '',
          bloodGroup: '',
          parentName: '',
          mobile: '',
          email: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          emergencyContact: '',
          teacherId: ''
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to admit student' })
      }
    } catch (error) {
      console.error('Admission error:', error)
      setMessage({ type: 'error', text: 'Failed to submit admission form. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      studentName: '',
      dob: '',
      gender: '',
      studentClass: classes[0] || 'Nursery',
      section: sections[0] || 'A',
      rollNo: '',
      bloodGroup: '',
      parentName: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      emergencyContact: '',
      teacherId: ''
    })
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Admit New Student</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <p className="font-semibold">{message.text}</p>
            {message.credentials && (
              <div className="mt-3 p-3 bg-white rounded border border-green-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">Login Credentials:</p>
                <p className="text-sm text-gray-700">Mobile: <span className="font-mono font-bold">{message.credentials.mobile}</span></p>
                <p className="text-sm text-gray-700">Password: <span className="font-mono font-bold">{message.credentials.password}</span></p>
                <p className="text-xs text-gray-600 mt-2">⚠️ Please save these credentials and share with the student/parent.</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Student Admission Form</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({...formData, studentClass: e.target.value})}
                >
                  {classes.map((className) => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                <input 
                  type="number" 
                  min="1"
                  step="1"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  placeholder="e.g., 1"
                />
              </div>

              {/* Assigned Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Teacher *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  disabled={loadingTeachers}
                >
                  <option value="">Select Teacher (Required)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} {teacher.designation ? `(${teacher.designation})` : ''}
                    </option>
                  ))}
                </select>
                {loadingTeachers && <p className="text-xs text-gray-500 mt-1">Loading teachers...</p>}
              </div>

              {/* Parent/Guardian Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.parentName}
                  onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  placeholder="Enter parent/guardian name"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number * (Login ID)</label>
                <input 
                  type="tel" 
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  placeholder="10-digit mobile number"
                />
                <p className="text-xs text-gray-500 mt-1">This will be used as login ID</p>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <input 
                  type="tel" 
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="Alternate contact number"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="student@example.com"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="House/Flat No., Street, Area"
                ></textarea>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Enter city"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="Enter state"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input 
                  type="text" 
                  required
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  placeholder="6-digit pincode"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Admit Student'}
              </button>
              <button 
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Reset Form
              </button>
            </div>

            {/* Info Note */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> Default password will be <span className="font-mono font-bold">{process.env.DEFAULT_STUDENT_PASSWORD || 'default123'}</span>. 
                The mobile number will be used as the login ID.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
