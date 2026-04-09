const Footer = () => {
  return (
    <footer className="bg-[#2c3e50] text-white py-[60px_0_20px] md:py-[40px_0_20px]" id="contact">
      <div className="container">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:grid-cols-1 gap-10 md:gap-[30px] mb-10">
          <div>
            <h3 className="text-[#ff6b35] text-[28px] mb-5">Foster Kids</h3>
            <p className="text-sm leading-[1.8] text-[#bdc3c7] mb-[15px]">
              Foster Kids Play School Chain was set up with the desire to nurture children and
              lay a healthy foundation for a learned society.
            </p>
            <div className="flex gap-[15px] mt-5">
              <a href="#" aria-label="Facebook" className="text-2xl transition-transform hover:scale-110">📘</a>
              <a href="#" aria-label="Twitter" className="text-2xl transition-transform hover:scale-110">🐦</a>
              <a href="#" aria-label="LinkedIn" className="text-2xl transition-transform hover:scale-110">💼</a>
              <a href="#" aria-label="Instagram" className="text-2xl transition-transform hover:scale-110">📷</a>
              <a href="#" aria-label="YouTube" className="text-2xl transition-transform hover:scale-110">📺</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white text-xl mb-5 font-semibold">Contact Info</h4>
            <div className="mb-5">
              <strong className="block text-white mb-2 text-[15px]">Location</strong>
              <p className="text-sm leading-[1.8] text-[#bdc3c7] my-[5px]">3907/16 Tri Nagar, Kanhaiya Nagar, New Delhi (110035)</p>
            </div>
            <div className="mb-5">
              <strong className="block text-white mb-2 text-[15px]">Contact us at</strong>
              <p className="text-sm leading-[1.8] text-[#bdc3c7] my-[5px]">Phone: <a href="tel:+919354456577" className="text-[#ff6b35] transition-colors hover:text-[#ff5722]">+ 91 - 9354456577</a></p>
              <p className="text-sm leading-[1.8] text-[#bdc3c7] my-[5px]">Email: <a href="mailto:franchise@fosterkids.in" className="text-[#ff6b35] transition-colors hover:text-[#ff5722]">franchise@fosterkids.in</a></p>
            </div>
            <div className="mb-5">
              <strong className="block text-white mb-2 text-[15px]">Opening Hours</strong>
              <p className="text-sm leading-[1.8] text-[#bdc3c7] my-[5px]">Mon - Sat 9:30 - 17:30</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white text-xl mb-5 font-semibold">Quick Links</h4>
            <ul className="list-none">
              <li className="mb-3"><a href="#home" className="text-[#bdc3c7] text-sm transition-colors hover:text-[#ff6b35]">Home</a></li>
              <li className="mb-3"><a href="#about" className="text-[#bdc3c7] text-sm transition-colors hover:text-[#ff6b35]">Who we are</a></li>
              <li className="mb-3"><a href="#programs" className="text-[#bdc3c7] text-sm transition-colors hover:text-[#ff6b35]">Programs</a></li>
              <li className="mb-3"><a href="#franchise" className="text-[#bdc3c7] text-sm transition-colors hover:text-[#ff6b35]">Franchise Process</a></li>
              <li className="mb-3"><a href="#testimonials" className="text-[#bdc3c7] text-sm transition-colors hover:text-[#ff6b35]">Testimonials</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-xl mb-5 font-semibold">Newsletter</h4>
            <p className="text-sm leading-[1.8] text-[#bdc3c7] mb-[15px]">Subscribe to our newsletter for latest news & updates.</p>
            <div className="flex flex-col gap-2.5 mt-[15px]">
              <input type="email" placeholder="Your email" className="p-[12px_15px] border-none rounded-[5px] text-sm" />
              <button className="bg-[#ff6b35] text-white border-none p-[12px_20px] text-sm font-semibold rounded-[5px] transition-colors hover:bg-[#ff5722]">SUBSCRIBE</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#34495e] pt-5 text-center">
          <p className="text-sm text-[#95a5a6] m-0">Copyright © 2026 Fosterkids Pre School Chain. All Right Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
