import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import GlobalBackground from './components/GlobalBackground';
import CustomCursor from './components/CustomCursor';
import Hero from './sections/Hero';
import About from './sections/About';
import Resume from './sections/Resume';
import Portfolio from './sections/Portfolio';
import Services from './sections/Services';
import Contact from './sections/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip text-primary">
      <GlobalBackground />
      <CustomCursor />
      <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

      <main className="relative z-10 w-full max-w-full p-0 transition-all xl:py-4 xl:pl-[268px] xl:pr-4 2xl:pl-[280px]">
        <div className="min-h-screen max-w-full overflow-x-clip overflow-y-visible bg-transparent shadow-panel xl:min-h-[calc(100svh-2rem)] xl:rounded-[2rem]">
          <Hero />
          <About />
          <Resume />
          <Portfolio />
          <Services />
          <Contact />
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default App;
