const About = () => {
  return (
    <section className="py-[100px] md:py-[60px] bg-white" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">ABOUT US</span>
          <h2>Welcome to FosterKids – Leading Preschool Franchise in India</h2>
          <div className="divider"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-1 gap-[60px] md:gap-10 items-center">
          <div>
            <p className="text-base leading-[1.8] text-[#555] mb-5">
              At FosterKids, we are dedicated to providing world-class early childhood
              education and nurturing the leaders of tomorrow. As one of the fastest-growing
              preschool franchises in India, we operate in over 100 cities, including a strong 
              presence in Delhi NCR and major metropolitan areas.
            </p>
            <p className="text-base leading-[1.8] text-[#555] mb-5">
              Founded by the experienced Foster Group of Schools, FosterKids blends innovative 
              teaching methods with a child-friendly curriculum tailored specifically for Indian 
              children. Our franchise model offers aspiring entrepreneurs and educators an excellent 
              opportunity to start and run successful play schools with complete support.
            </p>
            <p className="text-base leading-[1.8] text-[#555] mb-5">
              Foster Kids is proud to offer one of the best preschool franchise opportunities in 
              India, combining low investment, zero royalty, and end-to-end support. Whether you're 
              an entrepreneur, educator, or dreamer, our preschool franchise model empowers you to 
              start your own successful play school business with confidence.
            </p>
            <button className="bg-[#ff6b35] text-white border-none py-[14px] px-[35px] text-base font-semibold rounded-[25px] mt-5 transition-all hover:bg-[#ff5722] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,107,53,0.3)]">Explore More →</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[15px] p-[60px_30px] text-center text-white transition-transform hover:scale-105">
              <span className="text-[64px] block mb-[15px]">🎨</span>
              <p className="text-lg font-semibold m-0">Creative Learning</p>
            </div>
            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[15px] p-[60px_30px] text-center text-white transition-transform hover:scale-105">
              <span className="text-[64px] block mb-[15px]">📚</span>
              <p className="text-lg font-semibold m-0">Quality Education</p>
            </div>
            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[15px] p-[60px_30px] text-center text-white transition-transform hover:scale-105">
              <span className="text-[64px] block mb-[15px]">🤝</span>
              <p className="text-lg font-semibold m-0">Supportive Environment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
