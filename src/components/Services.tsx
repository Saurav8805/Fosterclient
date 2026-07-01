'use client';

import ScrollReveal from './ui/ScrollReveal'
import { Megaphone, Users, BookOpen, Building, Palette, Radio, Share2, Award, UserCheck, Calendar, GraduationCap, FileText, Compass, Settings, Briefcase, CheckCircle2 } from 'lucide-react'

const Services = () => {
  const categories = [
    {
      categoryTitle: 'Marketing & Branding',
      categoryIcon: <Megaphone className="w-6 h-6 text-white" />,
      color: 'from-pink-500 to-rose-600',
      lightBg: 'bg-pink-50',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-100',
      services: [
        { icon: <Palette className="w-5 h-5 text-pink-600" />, title: 'Marketing Designs' },
        { icon: <Radio className="w-5 h-5 text-pink-600" />, title: 'Local Marketing Guidance' },
        { icon: <Share2 className="w-5 h-5 text-pink-600" />, title: 'Social Media Management' },
      ]
    },
    {
      categoryTitle: 'Training & HR',
      categoryIcon: <Users className="w-6 h-6 text-white" />,
      color: 'from-indigo-500 to-violet-600',
      lightBg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-100',
      services: [
        { icon: <Award className="w-5 h-5 text-indigo-600" />, title: 'Certified Staff Training' },
        { icon: <UserCheck className="w-5 h-5 text-indigo-600" />, title: 'Staff Recruitment Support' },
        { icon: <Calendar className="w-5 h-5 text-indigo-600" />, title: 'Day-to-day Lesson Plans' },
      ]
    },
    {
      categoryTitle: 'Academics & Curriculum',
      categoryIcon: <BookOpen className="w-6 h-6 text-white" />,
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-100',
      services: [
        { icon: <GraduationCap className="w-5 h-5 text-emerald-600" />, title: 'Innovative Curriculum' },
        { icon: <Compass className="w-5 h-5 text-emerald-600" />, title: 'Academic Development' },
        { icon: <FileText className="w-5 h-5 text-emerald-600" />, title: 'Admission Mobilisation' },
      ]
    },
    {
      categoryTitle: 'Infrastructure & Ops',
      categoryIcon: <Building className="w-6 h-6 text-white" />,
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-100',
      services: [
        { icon: <Settings className="w-5 h-5 text-amber-600" />, title: 'Interior & Exterior Design' },
        { icon: <Briefcase className="w-5 h-5 text-amber-600" />, title: 'Operations Support' },
        { icon: <Award className="w-5 h-5 text-amber-600" />, title: 'Complete Student Kit' },
      ]
    }
  ]

  return (
    <section className="py-24 md:py-16 bg-white overflow-hidden relative" id="services">

      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{backgroundImage: 'radial-gradient(circle, #5e3a9e 1.5px, transparent 1.5px)', backgroundSize: '36px 36px'}}></div>

      <div className="container relative z-10">

        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#ff6b35] uppercase mb-3">
              <span className="w-6 h-px bg-[#ff6b35]"></span>
              Our Support System
              <span className="w-6 h-px bg-[#ff6b35]"></span>
            </span>
            <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              End-to-End Services We Provide
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#5e3a9e] to-[#e91e63] mx-auto rounded-full mb-5"></div>
            <p className="max-w-2xl mx-auto text-sm text-gray-500 font-normal leading-relaxed">
              From branding to daily operations, we equip every franchise partner with complete, ongoing institutional support to succeed.
            </p>
          </div>
        </ScrollReveal>

        {/* Centered Trust Badge Strip */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {['Zero Royalty', '100% Support', 'Training Included', 'Marketing Assistance'].map((badge, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-purple-700 text-xs font-bold px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {badge}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Category-Based Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, catIndex) => (
            <ScrollReveal
              key={catIndex}
              animation="fade-up"
              delay={catIndex * 80}
              className="h-full"
            >
              <div className={`group h-full bg-white rounded-3xl overflow-hidden border-2 ${cat.borderColor} hover:border-transparent hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] hover:-translate-y-1.5 transition-all duration-300`}>

                {/* Colored Header */}
                <div className={`bg-gradient-to-r ${cat.color} p-5 flex items-center gap-3 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                  <div className="relative w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {cat.categoryIcon}
                  </div>
                  <h3 className="relative text-lg font-extrabold text-white leading-tight">{cat.categoryTitle}</h3>
                </div>

                {/* Service Items */}
                <div className={`p-5 ${cat.lightBg} space-y-3`}>
                  {cat.services.map((service, sIndex) => (
                    <div key={sIndex} className={`flex items-center gap-3 bg-white p-3.5 rounded-xl border ${cat.borderColor} group-hover:shadow-sm transition-all duration-200`}>
                      <div className={`w-9 h-9 rounded-lg ${cat.lightBg} border ${cat.borderColor} flex items-center justify-center text-xl flex-shrink-0`}>
                        {service.icon}
                      </div>
                      <span className={`text-sm font-semibold text-gray-700 leading-snug`}>{service.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services