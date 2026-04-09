const Advantages = () => {
  const advantages = [
    {
      icon: '🏆',
      title: '13 Years of Proven Success',
      description: 'Thirteen years of unwavering commitment, dedication, and passion have marked a remarkable journey for our play school chain.'
    },
    {
      icon: '💻',
      title: 'Multimedia & Internet Based Teaching',
      description: 'Multimedia and internet-based teaching in play schools enhances the learning journey of young children, fostering engagement and creativity.'
    },
    {
      icon: '🎯',
      title: 'Use of Innovative Techniques',
      description: 'One of the key pillars of our approach is the incorporation of innovative teaching techniques into our curriculum.'
    },
    {
      icon: '📚',
      title: 'Unique Fosterkids Thematic Curriculum',
      description: 'A unique thematic curriculum tailored to the developmental needs and interests of young learners can ignite their curiosity and foster creativity.'
    },
    {
      icon: '🏢',
      title: 'State of The Art Infrastructure',
      description: 'In this colorful, chirpy, and air-conditioned classroom, every moment is filled with excitement, learning, and endless possibilities.'
    },
    {
      icon: '❤️',
      title: 'Goodwill among the Parents',
      description: 'By fostering goodwill among parents in a preschool setting, you create a supportive network that benefits both the children and the entire community.'
    }
  ]

  return (
    <section className="py-[100px] md:py-[60px] bg-white" id="advantages">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">ADVANTAGE</span>
          <h2>The Fosterkid's Advantage</h2>
          <div className="divider"></div>
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] md:grid-cols-1 gap-[30px] md:gap-5 mt-[50px]">
          {advantages.map((advantage, index) => (
            <div key={index} className="bg-[#f8f9fa] p-[40px_30px] md:p-[30px_20px] rounded-[15px] transition-all border-2 border-transparent hover:-translate-y-[10px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] hover:border-[#ff6b35]">
              <div className="text-[56px] mb-5">{advantage.icon}</div>
              <h3 className="text-[22px] text-[#333] mb-[15px] font-semibold">{advantage.title}</h3>
              <p className="text-[15px] text-[#666] leading-[1.7]">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Advantages
