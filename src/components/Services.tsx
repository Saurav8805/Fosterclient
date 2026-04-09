const Services = () => {
  const services = [
    { icon: '🎨', title: 'Marketing Designs' },
    { icon: '👨‍🏫', title: 'Teachers & Counsellor Training with Certification' },
    { icon: '👥', title: 'Staff Hiring Support' },
    { icon: '📢', title: 'Marketing Training' },
    { icon: '📖', title: 'Academic Support' },
    { icon: '⚙️', title: 'Day to Day Operation Support' },
    { icon: '💬', title: 'Help Desk' },
    { icon: '🏗️', title: 'Interior/Exterior Design' },
    { icon: '📚', title: 'Curriculum' },
    { icon: '📝', title: 'Admission Mobilisation' },
    { icon: '🎒', title: 'Student Kit (Books, Dress & Bag)' },
    { icon: '📅', title: 'Curriculum & Day to Day Lesson Planning' },
    { icon: '📱', title: 'Social Media FB Page, Instagram, Google Listing' }
  ]

  return (
    <section className="py-[100px] md:py-[60px] bg-[#f8f9fa]" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">KEY POINTS</span>
          <h2>SERVICES WE WILL PROVIDE</h2>
          <div className="divider"></div>
          <p className="max-w-[700px] mx-auto mt-5 text-base text-[#666] leading-[1.6]">
            We provide franchise as well as support to those schools which are already in operation. 
            Our main focus is already running schools.
          </p>
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[25px] md:gap-[15px] mt-[50px]">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-[35px_25px] md:p-[25px_15px] rounded-[12px] text-center transition-all border-2 border-transparent hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:border-[#667eea]">
              <div className="text-5xl md:text-4xl mb-[15px]">{service.icon}</div>
              <h3 className="text-base md:text-sm text-[#333] font-semibold leading-[1.4]">{service.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
