'use client';

import { useState, useEffect } from 'react'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    { id: 1, image: '/pic1.jpg', alt: 'Foster Kids Award Ceremony' },
    { id: 2, image: '/pic2.jpg', alt: 'Foster Kids Events' },
    { id: 3, image: '/pic3.jpg', alt: 'Foster Kids Recognition' },
    { id: 4, image: '/pic4.jpg', alt: 'Foster Kids Achievements' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 overflow-hidden" id="home">
      {/* Hero Slider with Purple Overlay */}
      <div className="relative w-full h-[600px] lg:h-[550px] md:h-[450px] sm:h-[380px]">
        {/* Background Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-30' : 'opacity-0'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.alt} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Content Container */}
        <div className="relative z-10 h-full max-w-[1200px] mx-auto px-5 flex items-center">
          <div className="w-full grid grid-cols-2 md:grid-cols-1 gap-8 items-center">
            {/* Right: Award Images */}
            <div className="relative h-full flex items-center justify-center md:hidden">
              <div className="relative w-full h-[400px]">
                {/* Main Award Image */}
                <div className="absolute top-0 right-0 w-[70%] h-[70%] rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                  <img src={slides[currentSlide].image} alt="Award Ceremony" className="w-full h-full object-cover" />
                </div>
                
                {/* Small Award Images */}
                <div className="absolute bottom-0 left-0 w-[45%] h-[35%] rounded-2xl overflow-hidden border-4 border-[#e91e63] shadow-xl">
                  <img src="/pic2.jpg" alt="Award 1" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-[30%] left-[15%] w-[40%] h-[32%] rounded-2xl overflow-hidden border-4 border-[#e91e63] shadow-xl">
                  <img src="/pic3.jpg" alt="Award 2" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-[15%] right-[10%] w-[38%] h-[30%] rounded-2xl overflow-hidden border-4 border-[#e91e63] shadow-xl">
                  <img src="/pic4.jpg" alt="Award 3" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-10 md:h-10 rounded-full bg-white/90 text-[#5e3a9e] flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-white hover:scale-110 transition-all"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-10 md:h-10 rounded-full bg-white/90 text-[#5e3a9e] flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-white hover:scale-110 transition-all"
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentSlide 
                  ? 'w-8 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/60 rounded-full hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Wavy Border Bottom */}
      <div className="h-12 relative overflow-hidden">
        <svg className="absolute top-0 w-full h-12" viewBox="0 0 1200 50" preserveAspectRatio="none">
          <path d="M0,25 Q300,50 600,25 T1200,25 L1200,0 L0,0 Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}

export default Hero
