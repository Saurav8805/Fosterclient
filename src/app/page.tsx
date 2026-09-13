'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Amenities from '../components/Amenities'
import About from '../components/About'
import Programs from '../components/Programs'
import Advantages from '../components/Advantages'
import Services from '../components/Services'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

export default function Home() {
  const router = useRouter()

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard/profile')
    }
  }, [router])

  return (
    <div className="w-full overflow-x-hidden">
      <Header />
      <Hero />
      <Amenities />
      <About />
      <Programs />
      <Advantages />
      <Services />
      <Testimonials />
      <Footer />
    </div>
  )
}