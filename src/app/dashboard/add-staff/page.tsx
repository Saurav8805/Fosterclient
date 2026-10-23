'use client';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { staffApi, validationApi } from '@/lib/api'
import { validateMobile, validateEmail, validateJoiningDate, cleanMobile } from '@/utils/validation'
import ValidationError from '@/components/ValidationError'

interface StaffCredentials {
  mobile: string;
  password: string;
}

interface AddStaffResponse {
  credentials?: StaffCredentials;
}

export default function AddStaffPage() {
  const router = useRouter()
  const [assignedClasses, setAssignedClasses] = useState<{ assignedClass: string; assignedSection: string; teacherName: string }[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    designation: '',
    department: '',
    assignedClass: '',
    assignedSection: '',
    joiningDate: '',
    salary: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string, credentials?: StaffCredentials } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Live validation state
  const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})
  const [checkingDuplicates, setCheckingDuplicates] = useState<Record<string, boolean>>({})
  
  // Debounce timeout refs
  const mobileCheckTimeout = useRef<NodeJS.Timeout | null>(null)

  const classList = ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']
  const sectionList = ['A', 'B', 'C', 'D']

  // Check role-based access & fetch taken class assignments
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) {
      router.push('/login')
      return
    }
    const roleNum = Number(role)
    
    // Only admin (role 6) can access this page
    if (roleNum !== 6) {
      router.push('/dashboard')
      return
    }

    fetchAssignedClasses()
  }, [])

  const fetchAssignedClasses = async () => {
    try {
      const res = await staffApi.getAssignedClasses() as { success: boolean; data?: any[] }
      if (res.success && res.data) {
        setAssignedClasses(res.data)
      }
    } catch (e) {
      console.error('Failed to fetch assigned classes:', e)
    }
  }

  const isPairTaken = (cls: string, sec: string) => {
    return assignedClasses.some(a => a.assignedClass === cls && a.assignedSection === sec)
  }

  const getAssignedTeacherName = (cls: string, sec: string) => {
    const found = assignedClasses.find(a => a.assignedClass === cls && a.assignedSection === sec)
    return found ? found.teacherName : null
  }
  
  // Mobile number live validation for staff
  const handleMobileLiveValidation = async (value: string) => {
    setLiveErrors(prev => ({...prev, mobile: ''}));
    
    if (!value) return;
    
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 0 && !/^[6-9]/.test(cleaned)) {
      setLiveErrors(prev => ({...prev, mobile: 'Must start with 6, 7, 8, or 9'}));
      return;
    }
    
    if (cleaned.length > 0 && cleaned.length < 10) {
      setLiveErrors(prev => ({...prev, mobile: `Enter ${10 - cleaned.length} more digit${10 - cleaned.length > 1 ? 's' : ''}`}));
      return;
    }
    
    if (cleaned.length === 10 && /^(\d)\1{9}$/.test(cleaned)) {
      setLiveErrors(prev => ({...prev, mobile: 'Cannot have all same digits'}));
      return;
    }
    
    if (cleaned.length === 10) {
      if (mobileCheckTimeout.current) clearTimeout(mobileCheckTimeout.current);
      
      mobileCheckTimeout.current = setTimeout(async () => {
        setCheckingDuplicates(prev => ({...prev, mobile: true}));
        
        try {
          const result = await validationApi.checkStaffMobile(cleaned);
          
          if (result.success && result.data?.exists) {
            setLiveErrors(prev => ({...prev, mobile: '❌ Mobile number already registered'}));
          } else {
            setLiveErrors(prev => ({...prev, mobile: ''}));
          }
        } catch (error) {
          console.error('Error checking mobile:', error);
        } finally {
          setCheckingDuplicates(prev => ({...prev, mobile: false}));
        }
      }, 500);
    }
  };

  // Pincode live validation
  const handlePincodeLiveValidation = (value: string) => {
    setLiveErrors(prev => ({...prev, pincode: ''}));
    
    if (!value) return;
    
    const cleaned = value.replace(/\D/g, '').slice(0, 6); // Limit to 6 digits max
    
    if (cleaned.startsWith('0')) {
      setLiveErrors(prev => ({...prev, pincode: 'Cannot start with 0'}));
      return;
    }
    
    if (cleaned.length > 0 && cleaned.length < 6) {
      setLiveErrors(prev => ({...prev, pincode: `Enter ${6 - cleaned.length} more digit${6 - cleaned.length > 1 ? 's' : ''}`}));
      return;
    }
  };

  // Email validation - must have @gmail.com
  const handleEmailLiveValidation = (value: string) => {
    setLiveErrors(prev => ({...prev, email: ''}));
    
    if (!value) return;
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value && !emailPattern.test(value)) {
      setLiveErrors(prev => ({...prev, email: 'Invalid email format'}));
      return;
    }
    
    if (value && !value.toLowerCase().endsWith('@gmail.com')) {
      setLiveErrors(prev => ({...prev, email: 'Email must be @gmail.com'}));
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if there are any live errors
    const hasLiveErrors = Object.values(liveErrors).some(error => error !== '');
    if (hasLiveErrors) {
      setMessage({ 
        type: 'error', 
        text: 'Please fix all validation errors before submitting.' 
      });
      return;
    }
    
    // Check if still checking duplicates
    const stillChecking = Object.values(checkingDuplicates).some(checking => checking);
    if (stillChecking) {
      setMessage({ 
        type: 'error', 
        text: 'Please wait while we verify your information...' 
      });
      return;
    }
    
    setLoading(true)
    setMessage(null)
    setErrors({})

    // Validate mobile number
    const mobileResult = validateMobile(formData.mobile)
    if (!mobileResult.valid) {
      setErrors(prev => ({ ...prev, mobile: mobileResult.error! }))
      setLoading(false)
      return
    }

    // Validate email if provided
    if (formData.email) {
      const emailResult = validateEmail(formData.email, false)
      if (!emailResult.valid) {
        setErrors(prev => ({ ...prev, email: emailResult.error! }))
        setLoading(false)
        return
      }
    }

    // Validate joining date if provided
    if (formData.joiningDate) {
      const dateResult = validateJoiningDate(formData.joiningDate)
      if (!dateResult.valid) {
        setErrors(prev => ({ ...prev, joiningDate: dateResult.error! }))
        setLoading(false)
        return
      }
    }

    // Validate emergency contact if provided
    if (formData.emergencyContact) {
      const emergencyResult = validateMobile(formData.emergencyContact)
      if (!emergencyResult.valid) {
        setErrors(prev => ({ ...prev, emergencyContact: emergencyResult.error! }))
        setLoading(false)
        return
      }
    }

    try {
      console.log('🔄 Adding staff member:', formData.fullName)
      
      // Assign roles based on designation
      // Role 5 = Admin, Role 6 = Principal, Role 7 = Teacher/Staff, Role 8 = Vice Principal
      let role = 7; // Default to Teacher/Staff
      
      if (formData.designation === 'Admin') {
        role = 5;
      } else if (formData.designation === 'Principal') {
        role = 6;
      } else if (formData.designation === 'Vice Principal') {
        role = 8;
      } else if (formData.designation === 'Teacher' || formData.designation === 'Support Staff') {
        role = 7;
      }
      
      const staffData = {
        fullName: formData.fullName,
        mobile: cleanMobile(formData.mobile),
        email: formData.email,
        designation: formData.designation,
        department: formData.department,
        assignedClass: formData.assignedClass,
        assignedSection: formData.assignedSection,
        joiningDate: formData.joiningDate,
        salary: formData.salary,
        address: formData.address,
        role: role
      }
      
      console.log('📤 Sending staff data:', staffData)
      
      const result = await staffApi.add(staffData) as { success: boolean; data?: AddStaffResponse; error?: string }

      console.log('📝 Add staff response:', result)

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Staff member added successfully!',
          credentials: result.data?.credentials
        })
        
        // Reset form & refresh assigned list
        handleReset()
        fetchAssignedClasses()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add staff member' })
      }
    } catch (error) {
      console.error('Add staff error:', error)
      setMessage({ type: 'error', text: 'Failed to submit form. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      designation: '',
      department: '',
      assignedClass: '',
      assignedSection: '',
      joiningDate: '',
      salary: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      emergencyContact: ''
    })
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
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
                <p className="text-xs text-gray-600 mt-2">⚠️ Please save these credentials and share with the staff member.</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Staff Information Form</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>

              {/* Mobile Number */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number * (Login ID)
                  {checkingDuplicates.mobile && (
                    <span className="ml-2 text-xs text-blue-600">
                      <span className="inline-block animate-spin">⟳</span> Checking...
                    </span>
                  )}
                </label>
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    liveErrors.mobile ? 'border-red-500 focus:ring-red-500' :
                    errors.mobile ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, mobile: value});
                    handleMobileLiveValidation(value);
                    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                  }}
                  placeholder="10-digit mobile number"
                />
                <ValidationError error={liveErrors.mobile} />
                {errors.mobile && !liveErrors.mobile && <p className="text-xs text-red-600 mt-1">❌ {errors.mobile}</p>}
                {!errors.mobile && !liveErrors.mobile && <p className="text-xs text-gray-500 mt-1">This will be used as login ID</p>}
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input 
                  type="email" 
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    liveErrors.email ? 'border-red-500 focus:ring-red-500' :
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    handleEmailLiveValidation(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="staff@gmail.com"
                />
                <ValidationError error={liveErrors.email} />
                {errors.email && !liveErrors.email && <p className="text-xs text-red-600 mt-1">❌ {errors.email}</p>}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.designation}
                  onChange={(e) => {
                    const newDesignation = e.target.value;
                    setFormData({...formData, designation: newDesignation});
                    
                    // Auto-set department based on designation
                    if (newDesignation === 'Admin') {
                      setFormData({...formData, designation: newDesignation, department: 'Administration'});
                    } else if (newDesignation === 'Principal') {
                      setFormData({...formData, designation: newDesignation, department: 'Head of School'});
                    } else if (newDesignation === 'Vice Principal') {
                      setFormData({...formData, designation: newDesignation, department: 'Deputy Head of School'});
                    } else if (newDesignation === 'Teacher') {
                      setFormData({...formData, designation: newDesignation, department: 'Faculty'});
                    } else if (newDesignation === 'Support Staff') {
                      setFormData({...formData, designation: newDesignation, department: 'Administration'});
                    } else {
                      setFormData({...formData, designation: newDesignation, department: ''});
                    }
                  }}
                >
                  <option value="">Select Designation</option>
                  <option value="Admin">Admin</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={true}
                >
                  <option value="">Select Department</option>
                  <option value="Head of School">Head of School</option>
                  <option value="Deputy Head of School">Deputy Head of School</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Administration">Administration</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Auto-assigned based on designation</p>
              </div>

              {/* Assigned Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Class (Optional for Teachers)</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.assignedClass}
                  onChange={(e) => setFormData({...formData, assignedClass: e.target.value})}
                >
                  <option value="">Select Class to Assign</option>
                  {classList.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Section</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.assignedSection}
                  onChange={(e) => setFormData({...formData, assignedSection: e.target.value})}
                >
                  <option value="">Select Section</option>
                  {sectionList.map(sec => {
                    const taken = formData.assignedClass ? isPairTaken(formData.assignedClass, sec) : false;
                    const teacher = formData.assignedClass ? getAssignedTeacherName(formData.assignedClass, sec) : null;
                    return (
                      <option key={sec} value={sec} disabled={taken}>
                        Section {sec} {taken ? `❌ (Assigned to ${teacher})` : '✓ (Available)'}
                      </option>
                    )
                  })}
                </select>
                {formData.assignedClass && formData.assignedSection && isPairTaken(formData.assignedClass, formData.assignedSection) && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Class {formData.assignedClass} - Section {formData.assignedSection} is already assigned to {getAssignedTeacherName(formData.assignedClass, formData.assignedSection)}. Please pick another section or class.
                  </p>
                )}
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary (₹) *</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  placeholder="Monthly salary"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact *</label>
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="Alternate contact number"
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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    liveErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  value={formData.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Limit to 6 digits
                    setFormData({...formData, pincode: value});
                    handlePincodeLiveValidation(value);
                  }}
                  placeholder="6-digit pincode"
                />
                <ValidationError error={liveErrors.pincode} />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-50 text-blue-700 border-2 border-blue-400 px-6 py-2 rounded-lg hover:bg-blue-100 transition disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Adding...' : 'Add Staff Member'}
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
                <span className="font-semibold">Note:</span> Default password will be <span className="font-mono font-bold">foster@123</span>. 
                The mobile number will be used as the login ID.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <span className="font-semibold">Access Levels:</span>
              </p>
              <ul className="text-sm text-blue-800 mt-1 ml-4 list-disc">
                <li><span className="font-semibold">Principal, Vice-Principal, Admin:</span> Full system access (Role 6)</li>
                <li><span className="font-semibold">Teacher, Support Staff:</span> Teaching staff access (Role 7)</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
