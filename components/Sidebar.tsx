import React, { useEffect, useState } from 'react';
import { profile } from '../data/profile';
import { Download, FileText, FolderKanban, Home, Instagram, Linkedin, Mail, Menu, MessageCircle, User, Wrench, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BurgundyWarpBackground from './ui/burgundy-warp-background';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'portfolio', label: 'Projects', icon: FolderKanban },
    { id: 'services', label: 'Capabilities', icon: Wrench },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { threshold: 0.28, rootMargin: '-15% 0px -55% 0px' },
    );
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const content = (
    <div className="flex h-full flex-col bg-white text-primary">
      <div className="flex justify-end p-3 xl:hidden">
        <button onClick={() => setIsOpen(false)} className="rounded-full border border-primary/15 p-2.5" aria-label="Close navigation"><X size={21} /></button>
      </div>

      <div className="px-4 pb-4 pt-4 text-center xl:pt-5">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-[3px] border-primary bg-mist shadow-soft xl:h-16 xl:w-16 2xl:h-[4.5rem] 2xl:w-[4.5rem]">
          <img src="/images/hashem-profile.webp" alt="Hashem Kayyali" className="h-full w-full object-cover" />
        </div>
        <h1 className="mt-3 font-heading text-lg font-extrabold 2xl:text-xl">{profile.name}</h1>
        <p className="mx-auto mt-1.5 max-w-[190px] text-[9px] font-semibold uppercase leading-4 tracking-[0.13em] text-primary/65 2xl:text-[10px]">{profile.role}</p>
        <div className="mt-3 flex justify-center gap-1.5 2xl:mt-4">
          <Social href={profile.social.linkedin} label="LinkedIn"><Linkedin size={15} /></Social>
          <Social href={profile.social.instagram} label="Instagram"><Instagram size={15} /></Social>
          <Social href={profile.social.whatsapp} label="WhatsApp"><MessageCircle size={15} /></Social>
          <Social href={profile.social.email} label="Email"><Mail size={15} /></Social>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3.5" aria-label="Primary navigation">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const active = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => goTo(item.id)}
                  className={`relative isolate flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${active ? 'bg-[#300510] text-white shadow-soft' : 'text-primary/65 hover:bg-mist hover:text-primary'}`}
                >
                  {active && (
                    <BurgundyWarpBackground
                      index={20 + index}
                      className="-z-10"
                      overlayOpacity={0.14}
                      rootMargin="0px"
                    />
                  )}
                  <item.icon size={17} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3.5 2xl:p-4">
        <a href="/resume/hashem-kayyali-resume.pdf" download className="relative isolate flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#300510] px-3 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-soft">
          <BurgundyWarpBackground index={30} className="-z-10" overlayOpacity={0.14} rootMargin="0px" />
          <Download size={17} className="relative z-10" />
          <span className="relative z-10">Download Resume</span>
        </a>
        <p className="mt-3 text-center text-[10px] text-silver">© {new Date().getFullYear()} Hashem Kayyali</p>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ zIndex: 70 }}
              className="fixed inset-0 bg-primary/80 backdrop-blur-sm xl:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 27, stiffness: 240 }}
              style={{ zIndex: 80 }}
              aria-label="Mobile navigation"
              className="fixed inset-y-0 left-0 w-[min(286px,88vw)] overflow-hidden bg-white shadow-panel xl:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="glass-panel fixed bottom-4 left-4 top-4 z-50 hidden w-[236px] overflow-hidden rounded-[1.5rem] xl:block 2xl:w-[248px]">{content}</aside>
    </>
  );
};

/** Sticky mobile/tablet header. Replaces the old hamburger that floated over content. */
export const MobileNav: React.FC<{ onOpen: () => void; isOpen: boolean }> = ({ onOpen, isOpen }) => (
  // Kept in flow while the drawer is open (no layout shift) but visually and
  // programmatically inert, so the hamburger never sits behind the drawer.
  <header className={`mobile-nav${isOpen ? ' mobile-nav--inert' : ''}`} aria-hidden={isOpen}>
    <div className="mobile-nav__brand">
      <div className="mobile-nav__avatar">
        <img src="/images/hashem-profile.webp" alt="" />
      </div>
      <div className="mobile-nav__text">
        <p className="mobile-nav__name">{profile.name}</p>
        <span className="mobile-nav__role">{profile.role}</span>
      </div>
    </div>
    <button
      type="button"
      onClick={onOpen}
      className="mobile-nav__menu"
      aria-label="Open navigation"
      tabIndex={isOpen ? -1 : undefined}
    >
      <Menu size={21} />
    </button>
  </header>
);

const Social = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="rounded-full border border-primary/15 p-2 text-primary transition hover:bg-primary hover:text-white">{children}</a>
);

export default Sidebar;
