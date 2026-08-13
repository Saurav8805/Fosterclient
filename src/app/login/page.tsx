'use client';

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call backend API using the API client
      const response = await authApi.login(mobile, password)

      if (!response.success) {
        setError(response.error || 'Login failed')
        return
      }

      // Store user data in localStorage
      const user = response.data?.user
      if (user) {
        localStorage.setItem('userId', user.id)
        localStorage.setItem('userMobile', user.mobile)
        localStorage.setItem('userRole', user.role.toString())
        localStorage.setItem('userName', user.full_name || user.mobile)
        
        // Store designation if available (for staff)
        if (user.additionalData && user.additionalData.designation) {
          localStorage.setItem('userDesignation', user.additionalData.designation)
          // Store teacher's assigned class/section
          if (user.additionalData.assigned_class) {
            localStorage.setItem('userClass', user.additionalData.assigned_class)
          }
          if (user.additionalData.assigned_section) {
            localStorage.setItem('userSection', user.additionalData.assigned_section)
          }
          if (user.additionalData.id) {
            localStorage.setItem('staffId', user.additionalData.id)
          }
        } else if (user.role === 19) {
          localStorage.setItem('userDesignation', 'Student')
          // Store student class/section if available
          if (user.additionalData?.class) {
            localStorage.setItem('userClass', user.additionalData.class)
          }
          if (user.additionalData?.section) {
            localStorage.setItem('userSection', user.additionalData.section)
          }
          if (user.additionalData?.id) {
            localStorage.setItem('studentId', user.additionalData.id)
          }
        }

        // Redirect to dashboard
        router.push('/dashboard/profile')
      } else {
        setError('Invalid response from server')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Cannot connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-3 sm:p-5">
      <div className="w-full max-w-[95%] sm:max-w-md md:max-w-[450px]">
        <div className="bg-white rounded-2xl sm:rounded-[20px] p-6 sm:p-8 md:p-[30px_25px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-6 sm:mb-[35px]">
            <Image src="/LOGO-2.png" alt="Foster Kids Logo" width={120} height={60} className="mb-4 sm:mb-5 mx-auto h-12 sm:h-[60px] w-auto" style={{ width: 'auto', height: 'clamp(48px, 15vw, 60px)' }} priority />
            <h1 className="text-2xl sm:text-[28px] md:text-2xl text-[#333] mb-2">Welcome Back!</h1>
            <p className="text-[#666] text-sm sm:text-[15px]">Login to your Foster Kids account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label htmlFor="mobile" className="text-xs sm:text-sm font-semibold text-[#333]">Mobile Number</label>
              <input
                type="text"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                required
                className="p-[10px_12px] sm:p-[12px_15px] border-2 border-[#e0e0e0] rounded-[10px] text-sm sm:text-[15px] transition-all focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] touch-manipulation"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#333]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full p-[10px_38px_10px_12px] sm:p-[12px_45px_12px_15px] border-2 border-[#e0e0e0] rounded-[10px] text-sm sm:text-[15px] transition-all focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] touch-manipulation"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-2.5 sm:px-3.5 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none z-20 cursor-pointer select-none touch-manipulation"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bg-[linear-gradient(135deg,#e91e63,#d81b60)] text-white border-none p-[12px] sm:p-[14px] text-sm sm:text-base font-semibold rounded-[10px] mt-2 sm:mt-2.5 transition-all shadow-[0_4px_15px_rgba(233,30,99,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(233,30,99,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation" 
              suppressHydrationWarning
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 sm:mt-[30px] text-center">
            <Link href="/" className="inline-block text-[#999] text-xs sm:text-sm mt-2 sm:mt-2.5 hover:text-[#667eea] touch-manipulation">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
