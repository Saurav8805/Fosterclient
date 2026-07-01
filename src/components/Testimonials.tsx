'use client';

import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'
import { ChevronLeft, ChevronRight, Star, Quote, UserCheck, Heart } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Nitu Kumari Thakur',
      location: 'Ahmedabad',
      text: 'After researching several preschool franchises, Foster Kids stood out for its comprehensive training, established brand presence, and clear growth potential.',
      type: 'franchise',
      rating: 5
    },
    {
      name: 'Ajay Kumar',
      location: 'Katihar',
      text: 'Partnering with Foster Kids has been a fantastic decision. The support, curriculum, and operational training provided have been exceptional.',
      type: 'franchise',
      rating: 5
    },
    {
      name: 'Riya Garg',
      location: 'Delhi',
      text: 'I cannot express enough gratitude for the wonderful experience my toddler had at Foster Kids. The staff are exceptionally caring, nurturing, and dedicated.',
      type: 'parent',
      rating: 5
    },
    {
      name: 'Mansi Gupta',
      location: 'Gurugram',
      text: "I love how this school focuses on the overall child's development. I'm impressed with their creative way of making kids learn new things! Highly recommended 👍🏻",
      type: 'parent',
      rating: 5
    },
    {
      name: 'Chanda Lohia',
      location: 'New Delhi',
      text: 'I always wanted to start a play school but lacked direction. The first meeting with Foster Kids team gave me the roadmap and confidence to take the leap.',
      type: 'franchise',
      rating: 5
    },
    {
      name: 'Monika Sharma',
      location: 'Jaipur',
      text: "As working parents, we are so thankful to Foster Kids. The clean, safe, and engaging environment ensures all our child's needs are taken care of.",
      type: 'parent',
      rating: 5
    }
  ]

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  const avatarColors = [
    'from-pink-400 to-rose-500',
    'from-violet-400 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-teal-400 to-emerald-500',
    'from-blue-400 to-indigo-500',
    'from-fuchsia-400 to-pink-500',
  ]

  return (
    <section className="py-24 md:py-16 bg-gradient-to-br from-[#1a0533] via-[#5e3a9e] to-[#2d1b69] text-white relative overflow-hidden" id="testimonials">

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 -left-24 w-96 h-96 rounded-full bg-pink-500/10 filter blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-10 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 filter blur-3xl animate-pulse-subtle" style={{animationDelay:'2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 filter blur-3xl"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
      </div>

      <div className="container relative z-10">

        {/* Section Header + Navigation Row */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-col items-center md:items-center justify-between mb-12 gap-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-pink-300 uppercase mb-3">
                <span className="w-8 h-px bg-pink-400"></span>
                Testimonials
                <span className="w-8 h-px bg-pink-400"></span>
              </span>
              <h2 className="text-4xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                What Our Partners & Parents Say
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full"></div>
            </div>
            {/* Arrow Controls */}
            <div className="flex gap-3">
              <button
                onClick={scrollLeft}
                className="w-12 h-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
                aria-label="Scroll reviews left"
              ><ChevronLeft className="w-6 h-6" /></button>
              <button
                onClick={scrollRight}
                className="w-12 h-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
                aria-label="Scroll reviews right"
              ><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
        </ScrollReveal>

        {/* Scrollable Container — shows 3 cards, rest scrollable */}
        <div
          ref={scrollRef}
          className="scrollbar-hide overflow-x-auto flex gap-6 py-4 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="w-[88vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex-shrink-0 snap-start"
            >
              <div className="h-full bg-white/[0.07] backdrop-blur-md border border-white/10 hover:bg-white/[0.12] hover:border-white/20 p-8 md:p-6 rounded-3xl flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] min-h-[300px]">

                {/* Top: Quote + Stars */}
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-pink-300/60 rotate-180" />
                  <div className="flex gap-1">
                    {Array.from({length: testimonial.rating}).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-white/80 text-sm leading-relaxed font-normal italic flex-grow mb-6">
                  {testimonial.text}
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[index]} flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 shadow-md`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{testimonial.name}</h4>
                    {testimonial.location && (
                      <span className="text-xs text-white/50 font-medium">{testimonial.location}</span>
                    )}
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    testimonial.type === 'franchise'
                      ? 'bg-blue-400/20 text-blue-200 border border-blue-300/20'
                      : 'bg-orange-400/20 text-orange-200 border border-orange-300/20'
                  }`}>
                    {testimonial.type === 'franchise' ? <UserCheck className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                    <span>{testimonial.type === 'franchise' ? 'Partner' : 'Parent'}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials