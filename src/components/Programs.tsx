'use client';

import ScrollReveal from './ui/ScrollReveal'
import { Sparkles, Sprout, BookOpen, GraduationCap, Clock, ArrowRight } from 'lucide-react'

const Programs = () => {
  const programs = [
    {
      title: 'PLAYGROUP',
      ageGroup: '1.5 – 2.5 Years',
      duration: '3 Hours Per Day',
      description: 'Our Play Group program focuses on nurturing new skills through play-based learning and sensory exploration.',
      icon: <Sparkles className="w-12 h-12 text-white stroke-[1.5]" />,
      bgGradient: 'from-pink-500 to-rose-600',
      lightBg: 'bg-pink-50',
      accentColor: 'text-pink-600',
      badgeBg: 'bg-pink-100 text-pink-700',
      btnGradient: 'from-pink-500 to-rose-500',
      shadowColor: 'hover:shadow-pink-200',
      borderColor: 'hover:border-pink-200',
      features: ['Sensory Play', 'Social Skills', 'Storytelling']
    },
    {
      title: 'NURSERY',
      ageGroup: '2.5 – 3.5 Years',
      duration: '3 Hours Per Day',
      description: 'Our Nursery program is a unique blend of essential communication development with creative and fun activities.',
      icon: <Sprout className="w-12 h-12 text-white stroke-[1.5]" />,
      bgGradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50',
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      btnGradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'hover:shadow-emerald-200',
      borderColor: 'hover:border-emerald-200',
      features: ['Language Skills', 'Music & Dance', 'Creative Arts']
    },
    {
      title: 'LKG',
      ageGroup: '3.5 – 4.5 Years',
      duration: '3 Hours Per Day',
      description: 'In the LKG Program, emphasis is laid on building foundational math, reading, and writing skills in a fun way.',
      icon: <BookOpen className="w-12 h-12 text-white stroke-[1.5]" />,
      bgGradient: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-700',
      btnGradient: 'from-blue-500 to-indigo-500',
      shadowColor: 'hover:shadow-blue-200',
      borderColor: 'hover:border-blue-200',
      features: ['Reading & Writing', 'Basic Numeracy', 'STEM Activities']
    },
    {
      title: 'UKG',
      ageGroup: '4.5 – 5.5 Years',
      duration: '3 Hours Per Day',
      description: 'In the UKG Program, emphasis is on building confidence, self-reliance, and complete primary school readiness.',
      icon: <GraduationCap className="w-12 h-12 text-white stroke-[1.5]" />,
      bgGradient: 'from-purple-500 to-violet-600',
      lightBg: 'bg-purple-50',
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-100 text-purple-700',
      btnGradient: 'from-purple-500 to-violet-500',
      shadowColor: 'hover:shadow-purple-200',
      borderColor: 'hover:border-purple-200',
      features: ['School Readiness', 'Advanced Literacy', 'Critical Thinking']
    }
  ]

  return (
    <section className="py-24 md:py-16 relative overflow-hidden" id="programs"
      style={{background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #fdf0f8 100%)'}}>

      {/* Decorative Blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-200/30 rounded-full filter blur-3xl pointer-events-none animate-float"></div>

      <div className="container relative z-10">

        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#ff6b35] uppercase mb-3">
              <span className="inline-block w-6 h-px bg-[#ff6b35]"></span>
              Our Programs
              <span className="inline-block w-6 h-px bg-[#ff6b35]"></span>
            </span>
            <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Pioneers in Early Childhood Education
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#5e3a9e] to-[#e91e63] mx-auto rounded-full"></div>
            <p className="max-w-2xl mx-auto mt-5 text-sm text-gray-500 leading-relaxed">
              Structured learning milestones designed to grow with your child — from first steps to school readiness.
            </p>
          </div>
        </ScrollReveal>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {programs.map((program, index) => (
            <ScrollReveal
              key={index}
              animation="fade-up"
              delay={index * 100}
              className="h-full"
            >
              <div className={`group h-full bg-white rounded-3xl overflow-hidden border-2 border-gray-100/80 ${program.borderColor} hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col`}>

                {/* Colorful Header Banner */}
                <div className={`bg-gradient-to-br ${program.bgGradient} p-6 text-center relative overflow-hidden`}>
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  {/* Age badge */}
                  <span className="relative inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-3">
                    {program.ageGroup}
                  </span>
                  {/* Big Icon */}
                  <div className="relative flex justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    {program.icon}
                  </div>
                  <h3 className="relative text-2xl font-extrabold text-white tracking-wide">
                    {program.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Duration pill */}
                  <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${program.accentColor} ${program.lightBg} px-3 py-1.5 rounded-full w-fit mb-4`}>
                    <Clock className="w-3.5 h-3.5" /> {program.duration}
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-grow">
                    {program.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {program.features.map((f, i) => (
                      <span key={i} className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${program.badgeBg}`}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href="#contact"
                    className={`flex items-center justify-center gap-2 w-full py-3 px-6 text-sm font-bold text-white rounded-full bg-gradient-to-r ${program.btnGradient} hover:scale-105 active:scale-95 shadow-md hover:shadow-lg transition-all duration-300`}
                  >
                    <span>Start Franchise</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programs