'use client';

import ScrollReveal from './ui/ScrollReveal'
import { CheckCircle2, Monitor, PlaySquare, Palette, Compass } from 'lucide-react'

const Amenities = () => {
  const amenities = [
    {
      title: 'Smart Classrooms',
      description: 'Air-conditioned learning rooms equipped with modern interactive touchscreens, educational media, and child-safe ergonomic furniture designed to spark curiosity.',
      image: '/pic5.jpg',
      tag: 'Digital Learning',
      icon: <Monitor className="w-3.5 h-3.5" />,
      tagColor: 'bg-blue-500 text-white',
      accentColor: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'group-hover:border-blue-200',
      points: ['Interactive Smart Boards', 'AC Climate Controlled', 'Child-safe Furniture']
    },
    {
      title: 'Indoor Adventure Zone',
      description: 'A clean, soft-padded safe playground with mini-slides, ball pits, and physical toys for motor skills and coordination development in a vibrant environment.',
      image: '/pic6.jpg',
      tag: 'Active Play',
      icon: <PlaySquare className="w-3.5 h-3.5" />,
      tagColor: 'bg-emerald-500 text-white',
      accentColor: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'group-hover:border-emerald-200',
      points: ['Soft Safety Flooring', 'Ball Pit & Slides', 'CCTV Monitored']
    },
    {
      title: 'Art & Craft Studio',
      description: 'A dedicated workspace filled with colors, clay modeling stations, and easels that foster artistic expression, fine motor skills, and creative thinking.',
      image: '/pic7.jpg',
      tag: 'Creativity',
      icon: <Palette className="w-3.5 h-3.5" />,
      tagColor: 'bg-pink-500 text-white',
      accentColor: 'from-pink-500/10 to-rose-500/10',
      borderColor: 'group-hover:border-pink-200',
      points: ['Painting & Sketching', 'Clay Modeling', 'Display Galleries']
    },
    {
      title: 'Discovery Corner',
      description: 'An interactive science and nature lab where young learners explore plants, mini globes, magnifying glasses, and hands-on experiments with guided exploration.',
      image: '/pic8.jpg',
      tag: 'Exploration',
      icon: <Compass className="w-3.5 h-3.5" />,
      tagColor: 'bg-amber-500 text-white',
      accentColor: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'group-hover:border-amber-200',
      points: ['Nature Experiments', 'Globe & Maps', 'Magnifying Activities']
    }
  ]

  return (
    <section className="py-24 md:py-16 bg-white relative overflow-hidden" id="amenities">

      {/* Subtle background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-100/50 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-100/50 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="container relative z-10">

        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest text-[#ff6b35] uppercase mb-3">
              Our Facilities
            </span>
            <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              World-Class Amenities For Early Learners
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#5e3a9e] to-[#e91e63] mx-auto rounded-full mb-5"></div>
            <p className="max-w-2xl mx-auto text-sm md:text-xs text-gray-500 font-normal leading-relaxed">
              We design our play schools with premium infrastructure, focusing on hygiene, child-proofing, and modern creative spaces.
            </p>
          </div>
        </ScrollReveal>

        {/* Amenities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {amenities.map((amenity, index) => (
            <ScrollReveal
              key={index}
              animation="fade-up"
              delay={index * 120}
              className="h-full"
            >
              <div className={`group h-full bg-white rounded-3xl overflow-hidden border-2 border-gray-100 ${amenity.borderColor} hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-400 flex flex-col`}>

                {/* Image – taller on large cards */}
                <div className="relative h-64 sm:h-52 overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={amenity.image}
                    alt={amenity.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  {/* Tag */}
                  <span className={`absolute top-4 left-4 ${amenity.tagColor} text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-full shadow-md flex items-center gap-1.5`}>
                    {amenity.icon}
                    {amenity.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-8 md:p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight group-hover:text-[#5e3a9e] transition-colors">
                    {amenity.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-normal mb-6 flex-grow">
                    {amenity.description}
                  </p>

                  {/* Feature bullet points */}
                  <div className={`flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100`}>
                    {amenity.points.map((point, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${amenity.accentColor} border border-gray-100`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Amenities