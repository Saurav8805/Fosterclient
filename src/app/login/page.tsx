'use client';

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Store user data in localStorage
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userMobile', data.user.mobile)
      localStorage.setItem('userRole', data.user.role.toString())
      localStorage.setItem('userName', data.user.full_name || data.user.mobile)

      // Redirect to dashboard
      router.push('/dashboard/profile')
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="w-full max-w-[450px]">
        <div className="bg-white rounded-[20px] p-10 sm:p-[30px_25px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-[35px]">
            <Image src="/LOGO-2.png" alt="Foster Kids Logo" width={120} height={60} className="mb-5 mx-auto" />
            <h1 className="text-[28px] sm:text-2xl text-[#333] mb-2">Welcome Back!</h1>
            <p className="text-[#666] text-[15px]">Login to your Foster Kids account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="mobile" className="text-sm font-semibold text-[#333]">Mobile Number</label>
              <input
                type="text"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                required
                className="p-[12px_15px] border-2 border-[#e0e0e0] rounded-[10px] text-[15px] transition-all focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-[#333]">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="p-[12px_15px] border-2 border-[#e0e0e0] rounded-[10px] text-[15px] transition-all focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>

            <button type="submit" className="bg-[linear-gradient(135deg,#e91e63,#d81b60)] text-white border-none p-[14px] text-base font-semibold rounded-[10px] mt-2.5 transition-all shadow-[0_4px_15px_rgba(233,30,99,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(233,30,99,0.4)]">Login</button>
          </form>

          <div className="mt-[30px] text-center">
            <Link href="/" className="inline-block text-[#999] text-sm mt-2.5 hover:text-[#667eea]">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
