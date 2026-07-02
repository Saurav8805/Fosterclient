'use client';

import { useState, useEffect } from 'react'
import { Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

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
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-pink-50/30 to-orange-50/50 overflow-hidden" id="home">
      {/* Dynamic Background Slides with Zoom Effect */}
      <div className="relative w-full min-h-[700px] lg:min-h-[650px] md:min-h-[600px] sm:min-h-[500px] flex items-center py-16 md:py-10">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-60 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.alt} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Soft background gradient overlay for optimal readability & rich visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/30 pointer-events-none"></div>

        {/* Subtle Decorative Gradients */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300/30 rounded-full filter blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-pink-300/20 rounded-full filter blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-8 items-center">
            
            {/* Left Column: Premium Text Content */}
            <div className="text-left max-w-xl md:max-w-full">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-semibold text-[#5e3a9e] mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                <span>India's Fast-Growing Play School Chain</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.15] mb-5">
                Nurturing Young Minds, <br className="sm:hidden" />
                Shaping <span className="text-gradient-primary">Future Leaders</span>
              </h1>
              
              <p className="text-lg sm:text-base text-gray-600 font-normal leading-relaxed mb-6">
                Welcome to Foster Kids, a leading preschool franchise operating in over 100+ cities. We blend unique play-based learning with a modern, child-centric curriculum designed specifically for young minds.
              </p>
              
              {/* USP Checklist */}
              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Zero Royalty & Low Investment Model', color: 'text-green-600 bg-green-50 border-green-200' },
                  { text: 'Unique Thematic Curriculum & Academic Support', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { text: 'Over 13+ Years of Educational Legacy', color: 'text-purple-600 bg-purple-50 border-purple-200' },
                ].map((usp, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium text-sm sm:text-base">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${usp.color}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    {usp.text}
                  </li>
                ))}
              </ul>
              
              {/* Action Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#programs" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#e91e63] to-[#5e3a9e] text-white px-8 py-3.5 text-base font-bold rounded-full hover:scale-105 btn-glowing transition-all duration-300 text-center shadow-lg"
                >
                  Explore Programs
                </a>
                <a 
                  href="#contact" 
                  className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 hover:text-[#5e3a9e] hover:border-[#5e3a9e] px-8 py-3.5 text-base font-bold rounded-full hover:scale-105 transition-all duration-300 text-center"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Right Column: Single Premium Showcase Slider (Changes 1 by 1) */}
            <div className="relative w-full flex items-center justify-center lg:mt-4">
              
              <div className="relative w-full max-w-[320px] aspect-[2/3] rounded-3xl overflow-hidden border-[3px] border-[#bc2fa9] shadow-[0_25px_60px_rgba(94,58,158,0.25)] animate-float bg-gray-900">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Navigation Arrows (Desktop / Tablet) */}
        <button 
          onClick={prevSlide}
          className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/80 hover:bg-white text-[#5e3a9e] items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/80 hover:bg-white text-[#5e3a9e] items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Mobile Navigation & Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button 
            onClick={prevSlide}
            className="sm:hidden w-8 h-8 rounded-full bg-white/90 text-[#5e3a9e] flex items-center justify-center shadow active:scale-95 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 h-2 bg-[#5e3a9e] rounded-full' 
                    : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-[#5e3a9e]/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="sm:hidden w-8 h-8 rounded-full bg-white/90 text-[#5e3a9e] flex items-center justify-center shadow active:scale-95 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Wavy Border Bottom */}
      
    </section>
  )
}

export default Hero