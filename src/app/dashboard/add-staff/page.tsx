'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddStaffPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    designation: '',
    department: '',
    joiningDate: '',
    salary: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string, credentials?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/staff/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Staff member added successfully!',
          credentials: result.data.credentials
        })
        
        // Reset form
        setFormData({
          fullName: '',
          mobile: '',
          email: '',
          designation: '',
          department: '',
          joiningDate: '',
          salary: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          emergencyContact: ''
        })
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

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="staff@example.com"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                >
                  <option value="">Select Designation</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Senior Teacher">Senior Teacher</option>
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Nursery">Nursery</option>
                  <option value="Administration">Administration</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary (₹)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  placeholder="Monthly salary"
                />
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

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="House/Flat No., Street, Area"
                ></textarea>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Enter city"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="Enter state"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input 
                  type="text" 
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
                <span className="font-semibold">Note:</span> Default password will be <span className="font-mono font-bold">{process.env.DEFAULT_STAFF_PASSWORD || 'foster@123'}</span>. 
                The mobile number will be used as the login ID. Staff members will have Faculty role (role 6).
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
