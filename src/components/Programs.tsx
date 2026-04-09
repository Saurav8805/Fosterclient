const Programs = () => {
  const programs = [
    {
      title: 'PLAYGROUP',
      ageGroup: '1.5 to 2.5 Years',
      duration: '3 Hours Per Day',
      description: 'Our Play Group program focuses on nurturing new skills through play-based learning and social interaction.',
      icon: '🎈'
    },
    {
      title: 'NURSERY',
      ageGroup: '2.5 to 3.5 Years',
      duration: '3 Hours Per Day',
      description: 'Our Nursery program is a unique blend of essential skills development with creative activities.',
      icon: '🌱'
    },
    {
      title: 'LKG',
      ageGroup: '3.5 To 4.5 Years',
      duration: '3 Hours Per Day',
      description: 'In the Fostering Kid Program, emphasis is laid on building foundational academic skills.',
      icon: '📖'
    },
    {
      title: 'UKG',
      ageGroup: '4.5 To 5.5 Years',
      duration: '3 Hours Per Day',
      description: 'In the Fostering Younger Program, emphasis is laid on building confidence and school readiness.',
      icon: '🎓'
    }
  ]

  return (
    <section className="py-[100px] md:py-[60px] bg-[#f8f9fa]" id="programs">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">OUR PROGRAM</span>
          <h2>WE ARE PIONEERS IN</h2>
          <div className="divider"></div>
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:grid-cols-1 gap-[30px] md:gap-5">
          {programs.map((program, index) => (
            <div key={index} className="bg-white rounded-[15px] p-[40px_30px] md:p-[30px_20px] text-center shadow-[0_5px_20px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-[10px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)]">
              <div className="text-[72px] mb-5">{program.icon}</div>
              <h3 className="text-2xl text-[#333] mb-5 font-bold">{program.title}</h3>
              <div className="bg-[#f8f9fa] p-[15px] rounded-[10px] mb-5">
                <p className="text-sm text-[#555] my-[5px] text-left">• Age Group: {program.ageGroup}</p>
                <p className="text-sm text-[#555] my-[5px] text-left">• Class Duration: {program.duration}</p>
              </div>
              <p className="text-[15px] text-[#666] leading-[1.6] mb-[25px]">{program.description}</p>
              <button className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3 px-[30px] text-sm font-semibold rounded-[25px] transition-all hover:scale-105 hover:shadow-[0_8px_20px_rgba(102,126,234,0.4)]">Start a Franchise</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programs
