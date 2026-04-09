const Stats = () => {
  const stats = [
    { icon: '🏆', number: '13+', label: 'Years Legacy' },
    { icon: '🏫', number: '123+', label: 'School Franchise' },
    { icon: '📍', number: '45+', label: 'States Covered' },
    { icon: '👨‍👩‍👧‍👦', number: '10000+', label: 'Happy Parents' }
  ]

  return (
    <section className="py-20 md:py-[60px] sm:py-[50px] xs:py-10 bg-[#f8f9fa] relative -mt-[60px] sm:-mt-10 pt-[100px] md:pt-[90px] sm:pt-20 xs:pt-[70px]">
      {/* Wavy Border Top */}
      <div className="absolute top-0 left-0 right-0 h-[60px] sm:h-10 bg-[#f8f9fa] overflow-hidden">
        <div className="absolute -top-px left-0 right-0 h-[60px] sm:h-10 bg-[#f8f9fa] rounded-[0_0_50%_50%/0_0_100%_100%]"></div>
      </div>
      
      <div className="container">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:grid-cols-2 xs:grid-cols-1 gap-10 md:gap-[25px] sm:gap-5 xs:gap-[15px]">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-10 md:p-[35px_20px] sm:p-[30px_15px] xs:p-[25px_12px] bg-white rounded-[15px] shadow-[0_5px_20px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-[10px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)]">
              <div className="text-[56px] md:text-5xl sm:text-[42px] xs:text-4xl mb-5 md:mb-5 sm:mb-3 xs:mb-[15px]">{stat.icon}</div>
              <h3 className="text-[42px] md:text-4xl sm:text-[32px] xs:text-[28px] text-[#ff6b35] mb-2.5 md:mb-2.5 sm:mb-2 xs:mb-2 font-bold">{stat.number}</h3>
              <p className="text-lg md:text-lg sm:text-base xs:text-sm text-[#666] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
