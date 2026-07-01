'use client';

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