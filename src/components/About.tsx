'use client';

import ScrollReveal from './ui/ScrollReveal'
import { Palette, BookOpen, HeartHandshake, ArrowRight } from 'lucide-react'

const About = () => {
  const highlights = [
    {
      icon: <Palette className="w-8 h-8 text-white" />,
      title: 'Creative Learning',
      desc: 'Art, music, and imaginative play that nurture artistic skills and build early confidence in children.',
      gradient: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/20',
      stat: '100+',
      statLabel: 'Creative Sessions / Year'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      title: 'Quality Education',
      desc: 'World-class thematic curriculum customized for the developmental needs of Indian children.',
      gradient: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/20',
      stat: '13+',
      statLabel: 'Years of Educational Excellence'
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-white" />,
      title: 'Supportive Environment',
      desc: 'Child-centric safety standards and dedicated staff ensuring every child feels nurtured and safe.',
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/20',
      stat: '10K+',
      statLabel: 'Happy Families'
    }
  ]

  return (
    <section className="py-24 md:py-16 bg-gray-50 overflow-hidden relative" id="about">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-100/60 filter blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-pink-100/60 filter blur-3xl"></div>
      </div>

      <div className="container relative z-10">

        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest text-[#ff6b35] uppercase mb-3">
              Who We Are
            </span>
            <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900 mb-4 max-w-2xl mx-auto leading-tight">
              Welcome to Foster Kids – Leading Preschool Franchise in India
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#5e3a9e] to-[#e91e63] mx-auto rounded-full"></div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* Left: Text Content */}
          <ScrollReveal animation="fade-left" className="space-y-6">
            <p className="text-base md:text-sm text-gray-600 leading-relaxed">
              At Foster Kids, we are dedicated to providing world-class early childhood education and nurturing the leaders of tomorrow. As one of the fastest-growing preschool franchises in India, we operate in over 100 cities, including a strong presence in Delhi NCR.
            </p>
            <p className="text-base md:text-sm text-gray-600 leading-relaxed">
              Founded by the experienced Foster Group of Schools, Foster Kids blends innovative teaching methods with a child-friendly curriculum tailored specifically for Indian children. Our model offers aspiring entrepreneurs an excellent opportunity to run successful play schools with complete support.
            </p>
            <p className="text-base md:text-sm text-gray-600 leading-relaxed">
              We combine low investment, zero royalty, and end-to-end support. Whether you're an entrepreneur, educator, or dreamer, our franchise model empowers you to build a successful play school with confidence.
            </p>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { num: '120+', label: 'Centres' },
                { num: '45+', label: 'Cities' },
                { num: '0', label: 'Royalty' }
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <span className="text-3xl font-extrabold text-gradient-primary">{s.num}</span>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff6b35] to-[#e91e63] text-white border-none py-3.5 px-8 text-base font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_25px_rgba(233,30,99,0.3)] group"
              >
                Inquire for Franchise
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </a>
            </div>
          </ScrollReveal>

          {/* Right: Attractive Feature Cards */}
          <div className="flex flex-col gap-5">
            {highlights.map((item, index) => (
              <ScrollReveal key={index} animation="fade-right" delay={index * 120}>
                <div className={`group flex items-start gap-5 bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-default`}>
                  {/* Icon Block */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl shadow-lg ${item.shadow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {item.icon}
                  </div>
                  {/* Text Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-lg font-extrabold text-gray-900 group-hover:text-[#5e3a9e] transition-colors">{item.title}</h4>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-black text-gray-900">{item.stat}</div>
                        <div className="text-[10px] text-gray-400 font-semibold leading-tight max-w-[90px]">{item.statLabel}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About