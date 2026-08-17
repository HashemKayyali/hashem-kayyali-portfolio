import React, { useEffect, useState } from 'react';
import Sidebar, { MobileNav } from './components/Sidebar';
import { startSmoothScroll } from './components/smoothScroll';
import GlobalBackground from './components/GlobalBackground';
import LanguageProvider from './i18n/LanguageProvider';
import type { Locale } from './content/types';
import Hero from './sections/Hero';
import About from './sections/About';
import Resume from './sections/Resume';
import Portfolio from './sections/Portfolio';
import Services from './sections/Services';
import Contact from './sections/Contact';
import Footer from './components/Footer';

interface AppProps {
  /** Supplied during prerendering, where there is no URL to read. */
  initialLocale?: Locale;
}

const App: React.FC<AppProps> = ({ initialLocale }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => startSmoothScroll(), []);

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <div className="relative min-h-screen max-w-full overflow-x-clip text-primary">
        <GlobalBackground />
        <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

        {/* `app-main` carries the sidebar inset so RTL can mirror it in CSS —
            the utility classes below are physical and cannot flip themselves. */}
        <main className="app-main relative z-10 w-full max-w-full p-0 transition-all xl:py-4 xl:pl-[268px] xl:pr-4 2xl:pl-[280px]">
          <div className="min-h-screen max-w-full overflow-x-clip overflow-y-visible bg-transparent xl:min-h-[calc(100svh-2rem)] xl:rounded-[2rem]">
            <MobileNav onOpen={() => setMobileMenuOpen(true)} isOpen={mobileMenuOpen} />
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
    </LanguageProvider>
  );
};

export default App;
