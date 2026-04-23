'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-[#5e3a9e] text-white py-2 text-[11px] border-b border-[#4a2d7e]">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="flex justify-between items-center">
            {/* Left: Contact Info */}
            <div className="flex items-center gap-4">
              <span>
                <strong>Call Us :</strong> <a href="tel:9354456577" className="hover:underline">9354456577</a>
              </span>
              <span className="hidden md:inline">
                <strong>Mail Us :</strong> <a href="mailto:franchise@fosterkids.in" className="hover:underline">franchise@fosterkids.in</a>
              </span>
              <span className="hidden lg:inline">
                <strong>Timing :</strong> 9:30 - 17:30 | <strong>Student Admissions:</strong> 8700586501
              </span>
            </div>
            
            {/* Right: Social Media */}
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Follow us on :</span>
              <div className="flex gap-1.5">
                <a href="https://www.facebook.com/fosterkids.playschool" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#4267B2] flex items-center justify-center hover:scale-110 transition">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://twitter.com/FosterKids8" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#1DA1F2] flex items-center justify-center hover:scale-110 transition">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/foster-kids-128522314/" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#0077B5] flex items-center justify-center hover:scale-110 transition">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.instagram.com/fosterkidsadmin/" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center hover:scale-110 transition">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
                <a href="https://www.youtube.com/channel/UCCzyBuPBLdcvCzVAt4kBR8g" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://in.pinterest.com/fosterkidsdelhi/" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#E60023] flex items-center justify-center hover:scale-110 transition">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wavy Border Top */}
      <div className="h-8 bg-[#5e3a9e] relative overflow-hidden">
        <svg className="absolute bottom-0 w-full h-8" viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d="M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z" fill="white"/>
        </svg>
      </div>
      
      {/* Main Navigation */}
      <header className="bg-white py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image src="/LOGO-2.png" alt="Foster Kids" width={120} height={64} className="h-16 w-auto object-contain" style={{ width: 'auto', height: '4rem' }} priority />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#about" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">About ▾</a>
              <a href="#academics" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Academics ▾</a>
              <a href="#franchise" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Franchise ▾</a>
              <a href="#programs" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Programs ▾</a>
              <a href="#nep2020" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">NEP 2020 ▾</a>
              <a href="#associations" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Associations ▾</a>
              <a href="#gallery" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Gallery</a>
              <a href="#blogs" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Blogs</a>
              <a href="#contact" className="text-[#333] text-sm font-medium hover:text-[#e91e63] transition">Contact</a>
            </nav>
            
            {/* Login Button */}
            <div className="hidden lg:block">
              <button onClick={() => router.push('/login')} className="bg-gradient-to-r from-[#e91e63] to-[#d81b60] text-white px-6 py-2.5 text-sm font-semibold rounded-full hover:shadow-lg transition-all" suppressHydrationWarning>
                Login
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-2xl text-[#333]" suppressHydrationWarning>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col gap-2">
                <a href="#about" className="text-[#333] text-sm py-2 border-b border-gray-100">About</a>
                <a href="#academics" className="text-[#333] text-sm py-2 border-b border-gray-100">Academics</a>
                <a href="#franchise" className="text-[#333] text-sm py-2 border-b border-gray-100">Franchise</a>
                <a href="#programs" className="text-[#333] text-sm py-2 border-b border-gray-100">Programs</a>
                <a href="#nep2020" className="text-[#333] text-sm py-2 border-b border-gray-100">NEP 2020</a>
                <a href="#associations" className="text-[#333] text-sm py-2 border-b border-gray-100">Associations</a>
                <a href="#gallery" className="text-[#333] text-sm py-2 border-b border-gray-100">Gallery</a>
                <a href="#blogs" className="text-[#333] text-sm py-2 border-b border-gray-100">Blogs</a>
                <a href="#contact" className="text-[#333] text-sm py-2">Contact</a>
              </nav>
              <button onClick={() => router.push('/login')} className="w-full mt-4 bg-gradient-to-r from-[#e91e63] to-[#d81b60] text-white px-6 py-2.5 text-sm font-semibold rounded-full" suppressHydrationWarning>
                Login
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Wavy Border Bottom */}
      <div className="h-8 bg-white relative overflow-hidden">
        <svg className="absolute top-0 w-full h-8" viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d="M0,20 Q300,40 600,20 T1200,20 L1200,0 L0,0 Z" fill="white"/>
        </svg>
      </div>
    </>
  )
}

export default Header
