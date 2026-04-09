'use client';

import { useState } from 'react'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Nitu Kumari Thakur',
      location: 'Ahmedabad',
      text: 'After researching several preschool franchises, Foster Kids stood out for its comprehensive training, established brand presence, and clear growth potential.',
      type: 'franchise'
    },
    {
      name: 'Ajay Kumar',
      location: 'Katihar',
      text: 'Partnering with Foster Kids has been a fantastic decision. The support and training provided have been exceptional.',
      type: 'franchise'
    },
    {
      name: 'Riya Garg',
      location: '',
      text: 'I cannot express enough gratitude for the wonderful experience my toddler had at Foster Kids. The staff are exceptionally caring, nurturing, and dedicated.',
      type: 'parent'
    },
    {
      name: 'Mansi Gupta',
      location: '',
      text: 'I love how this school focuses on overall development of child. I\'m impressed with their way of making kids learn new things! Highly recommended 👍🏻',
      type: 'parent'
    },
    {
      name: 'Chanda Lohia',
      location: 'New Delhi',
      text: 'I always thought of setting up a play school but was not finding enough planning and strength. The first meeting with Foster kids team instilled in me a lot of confidence.',
      type: 'franchise'
    },
    {
      name: 'Monika Sharma',
      location: 'Jaipur',
      text: 'Me and my husband are a working couple. We are so thankful to Foster Kids that all our child\'s needs are taken care of.',
      type: 'parent'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-[100px] md:py-[60px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-tag !text-white">TESTIMONIALS</span>
          <h2 className="!text-white">WHAT OUR FRANCHISE PARTNERS & PARENTS SAY</h2>
          <div className="divider !bg-white"></div>
        </div>
        
        <div className="relative mt-[50px] flex items-center gap-5">
          <button className="bg-white text-[#667eea] border-none w-[50px] h-[50px] md:hidden rounded-full text-[32px] cursor-pointer transition-all flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:scale-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]" onClick={prevTestimonial} aria-label="Previous">
            ‹
          </button>
          
          <div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-[30px] flex-1">
            {testimonials.slice(currentIndex, currentIndex + 3).map((testimonial, index) => (
              <div key={index} className="bg-white text-[#333] p-[40px_30px] md:p-[30px_20px] rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative min-h-[300px] md:min-h-auto flex flex-col">
                <div className="text-[60px] text-[#ff6b35] leading-none mb-[15px] font-[Georgia,serif]">"</div>
                <p className="text-[15px] leading-[1.7] text-[#555] flex-1 mb-5">{testimonial.text}</p>
                <div className="mt-auto">
                  <h4 className="text-lg text-[#333] mb-[5px]">{testimonial.name}</h4>
                  {testimonial.location && <span className="text-sm text-[#999]">{testimonial.location}</span>}
                </div>
                <div className={`inline-block py-[6px] px-3 rounded-[20px] text-xs mt-[15px] font-semibold ${testimonial.type === 'franchise' ? 'bg-[#e3f2fd] text-[#1976d2]' : 'bg-[#fff3e0] text-[#f57c00]'}`}>
                  {testimonial.type === 'franchise' ? '🤝 Franchise Partner' : '👨‍👩‍👧 Parent'}
                </div>
              </div>
            ))}
          </div>
          
          <button className="bg-white text-[#667eea] border-none w-[50px] h-[50px] md:hidden rounded-full text-[32px] cursor-pointer transition-all flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:scale-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]" onClick={nextTestimonial} aria-label="Next">
            ›
          </button>
        </div>
        
        <div className="flex justify-center gap-2.5 mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full bg-white/40 border-none cursor-pointer transition-all ${index === currentIndex ? 'bg-white !w-[30px] rounded-[6px]' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
