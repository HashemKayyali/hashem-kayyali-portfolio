import React, { useEffect, useRef, useState } from 'react';
import { PROFILE_IMAGE, profile, RESUME_PDF } from '../data/profile';
import { Download, FileText, FolderKanban, Home, Instagram, Linkedin, Mail, Menu, MessageCircle, User, Wrench, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BurgundyWarpBackground from './ui/burgundy-warp-background';
import LanguageSelector from './LanguageSelector';
import { scrollToTarget } from './smoothScroll';
import { useI18n } from '../i18n/useI18n';
import type { Dictionary } from '../content/types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

/** Section id paired with the dictionary key that names it. */
const NAV_ITEMS = [
  { id: 'home', key: 'home', icon: Home },
  { id: 'about', key: 'about', icon: User },
  { id: 'resume', key: 'resume', icon: FileText },
  { id: 'portfolio', key: 'projects', icon: FolderKanban },
  { id: 'services', key: 'capabilities', icon: Wrench },
  { id: 'contact', key: 'contact', icon: Mail },
] as const satisfies readonly {
  id: string;
  key: keyof Dictionary['navigation'];
  icon: React.ElementType;
}[];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t, dir } = useI18n();
  const [activeSection, setActiveSection] = useState('home');

  // A ratio threshold can never be met by sections taller than the observation
  // band, which left About/Resume/Projects permanently inactive. Instead watch a
  // thin band near the top and take the first section crossing it.
  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const crossing = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => crossing.set(entry.target.id, entry.isIntersecting));
        const active = ids.find((id) => crossing.get(id));
        if (active) setActiveSection(active);
      },
      { threshold: 0, rootMargin: '-24% 0px -70% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setIsOpen(false);
    // Through Lenis when it is running, so navigating lands with the same
    // easing as a wheel scroll instead of the browser's own smooth scroll
    // fighting it for the same frames.
    const target = document.getElementById(id);
    if (target) scrollToTarget(target);
  };

  const content = (
    <div className="sidebar-surface flex h-full flex-col text-primary">

      <div className="flex justify-end p-3 xl:hidden">
        <button onClick={() => setIsOpen(false)} className="rounded-full border border-primary/15 p-2.5" aria-label={t.navigation.closeNavigation}><X size={21} /></button>
      </div>

      <div className="px-4 pb-4 pt-4 text-center xl:pt-5">
        <div className="nav-avatar">
          <img src={PROFILE_IMAGE} alt={t.ui.alt.profile} />
        </div>
        {/* Not a heading: this block renders twice (docked rail and drawer), and
            the page's single h1 belongs to the hero. */}
        <p className="mt-3 font-heading text-lg font-extrabold 2xl:text-xl">{t.identity.name}</p>
        <p className="mx-auto mt-1.5 max-w-[190px] text-[9px] font-semibold uppercase leading-4 tracking-[0.13em] text-primary/65 2xl:text-[10px]">{t.identity.role}</p>
        <div className="mt-3 flex justify-center gap-1.5 2xl:mt-4">
          <Social href={profile.social.linkedin} label={t.contact.index.linkedin}><Linkedin size={15} /></Social>
          <Social href={profile.social.instagram} label={t.contact.index.instagram}><Instagram size={15} /></Social>
          <Social href={profile.social.whatsapp} label={t.contact.actions.whatsapp}><MessageCircle size={15} /></Social>
          <Social href={profile.social.email} label={t.contact.index.email}><Mail size={15} /></Social>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3.5" aria-label={t.navigation.primaryNavigation}>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => goTo(item.id)}
                  className={`nav-row relative isolate flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${active ? 'nav-item--active text-white' : 'nav-item text-primary/65'}`}
                >
                  <item.icon size={17} className="relative z-10" />
                  <span className="relative z-10">{t.navigation[item.key]}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* In the scroller rather than the pinned footer: the expanded list is
            taller than the footer block, and here it can simply scroll. */}
        <LanguageSelector />
      </nav>

      <div className="p-3.5 2xl:p-4">
        <a href={RESUME_PDF} download className="nav-resume relative isolate flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2.5 text-[13px] font-bold text-white">
          <BurgundyWarpBackground index={30} className="-z-10" overlayOpacity={0.14} rootMargin="0px" />
          <Download size={17} className="relative z-10" />
          <span className="relative z-10">{t.navigation.downloadResume}</span>
        </a>
        {/* Latin throughout, so it keeps its own direction: bidi would other-
            wise move the © to the end of the line inside Arabic. */}
        <p className="mt-3 text-center text-[10px] text-silver" dir="ltr">© {new Date().getFullYear()} {t.footer.copyrightName}</p>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              aria-label={t.navigation.closeNavigation}
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ zIndex: 70 }}
              className="drawer-scrim fixed inset-0 xl:hidden"
            />
            <motion.aside
              // The drawer is docked to the reading-start edge, so in RTL it
              // enters from the right. CSS mirrors the docking; this mirrors
              // the travel, which Framer Motion drives inline.
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 27, stiffness: 240 }}
              style={{ zIndex: 80 }}
              aria-label={t.navigation.mobileNavigation}
              className="glass-panel mobile-drawer fixed inset-y-0 left-0 w-[min(286px,88vw)] overflow-hidden xl:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="sidebar-dock glass-panel fixed bottom-4 left-4 top-4 z-50 hidden w-[236px] overflow-hidden rounded-[1.5rem] xl:block 2xl:w-[248px]">{content}</aside>
    </>
  );
};

/**
 * `position: sticky` pins to the LAYOUT viewport, which is not what you are
 * looking at once the page is pinch-zoomed — the bar drifts off the top of the
 * screen, or floats mid-page after zooming out. The visual viewport's offset
 * from the layout viewport is exactly that drift, so translating the bar by it
 * puts it back on the top edge of what is actually on screen. At scale 1 both
 * viewports coincide and the transform is removed entirely, so ordinary
 * scrolling keeps the plain sticky behaviour.
 */
const useVisualViewportPin = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!vv || !el) return;

    const sync = () => {
      const zoomed = Math.abs(vv.scale - 1) >= 0.01;
      el.style.transform = zoomed ? `translate(${vv.offsetLeft}px, ${vv.offsetTop}px)` : '';
    };

    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, []);

  return ref;
};

/** Sticky mobile/tablet header. Replaces the old hamburger that floated over content. */
export const MobileNav: React.FC<{ onOpen: () => void; isOpen: boolean }> = ({ onOpen, isOpen }) => {
  const { t } = useI18n();
  const ref = useVisualViewportPin();

  return (
    // Kept in flow while the drawer is open (no layout shift) but visually and
    // programmatically inert, so the hamburger never sits behind the drawer.
    <header ref={ref} className={`mobile-nav${isOpen ? ' mobile-nav--inert' : ''}`} aria-hidden={isOpen}>
      <div className="mobile-nav__brand">
        <div className="mobile-nav__avatar">
          <img src={PROFILE_IMAGE} alt="" />
        </div>
        <div className="mobile-nav__text">
          <p className="mobile-nav__name">{t.identity.name}</p>
          <span className="mobile-nav__role">{t.identity.role}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mobile-nav__menu"
        aria-label={t.navigation.openNavigation}
        tabIndex={isOpen ? -1 : undefined}
      >
        <Menu size={21} />
      </button>
    </header>
  );
};

const Social = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="rounded-full border border-primary/15 p-2 text-primary transition hover:bg-primary hover:text-white">{children}</a>
);

export default Sidebar;
