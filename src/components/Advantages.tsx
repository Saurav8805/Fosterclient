'use client';

import ScrollReveal from './ui/ScrollReveal'
import { Trophy, MonitorPlay, Target, BookCheck, Building2, HeartHandshake } from 'lucide-react'

const Advantages = () => {
  const advantages = [
    {
      icon: <Trophy className="w-7 h-7" />,
      title: '13 Years of Proven Success',
      description: 'Thirteen years of unwavering commitment, dedication, and educational excellence have defined our journey.',
      theme: 'from-amber-500/10 to-yellow-500/10 text-amber-600'
    },
    {
      icon: <MonitorPlay className="w-7 h-7" />,
      title: 'Multimedia & Interactive Teaching',
      description: 'Innovative multimedia and technology-guided learning that makes learning interactive and highly engaging.',
      theme: 'from-blue-500/10 to-indigo-500/10 text-blue-600'
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: 'Innovative Pedagogical Techniques',
      description: 'Incorporation of global creative learning techniques custom-tailored for early childhood psychology.',
      theme: 'from-pink-500/10 to-rose-500/10 text-pink-600'
    },
    {
      icon: <BookCheck className="w-7 h-7" />,
      title: 'Unique Thematic Curriculum',
      description: 'A scientifically structured curriculum designed to support active physical, cognitive, and social development.',
      theme: 'from-emerald-500/10 to-teal-500/10 text-emerald-600'
    },
    {
      icon: <Building2 className="w-7 h-7" />,
      title: 'State-of-the-Art Infrastructure',
      description: 'Vibrant, safe, and air-conditioned classes featuring play zones designed for unlimited creativity.',
      theme: 'from-purple-500/10 to-violet-500/10 text-purple-600'
    },
    {
      icon: <HeartHandshake className="w-7 h-7" />,
      title: 'Deep Parent Trust & Goodwill',
      description: 'Building close partnerships with families to cultivate a nurturing, safe, and supportive school environment.',
      theme: 'from-rose-500/10 to-pink-500/10 text-rose-600'
    }
  ]

  return (
    <section className="py-24 md:py-16 bg-white overflow-hidden" id="advantages">
      <div className="container">
        
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="section-header text-center mb-16">
            <span className="section-tag inline-block text-xs font-bold tracking-widest text-[#ff6b35] uppercase mb-2">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              The Foster Kids Advantage
            </h2>
            <div className="divider w-24 h-1.5 bg-gradient-to-r from-[#5e3a9e] to-[#e91e63] mx-auto rounded-full"></div>
          </div>
        </ScrollReveal>
        
        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {advantages.map((advantage, index) => (
            <ScrollReveal 
              key={index} 
              animation="fade-up" 
              delay={index * 80}
              className="h-full"
            >
              <div className="h-full bg-gray-50/50 hover:bg-white p-8 md:p-6 rounded-3xl border border-gray-100/80 hover:border-purple-200 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(94,58,158,0.05)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-start text-left group">
                
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${advantage.theme} flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  {advantage.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  {advantage.title}
                </h3>
                
                <p className="text-sm text-gray-500 leading-relaxed font-normal flex-grow">
                  {advantage.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Advantages