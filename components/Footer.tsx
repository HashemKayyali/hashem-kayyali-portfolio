import React from 'react';
import {
  ArrowUp,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useReveal } from './useReveal';
import { profile } from '../data/profile';

/**
 * Closing panel. It carries no animated field of its own: it is the same
 * floating liquid-glass card as the sidebar and the pinned section headers, so
 * the page ends on the chrome it has been navigated by rather than on a fourth
 * kind of surface.
 */
const sections = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Resume', href: '#resume' },
  { label: 'Projects', href: '#portfolio' },
  { label: 'Capabilities', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

const socials = [
  { label: 'Email', href: profile.social.email, Icon: Mail },
  { label: 'WhatsApp', href: profile.social.whatsapp, Icon: MessageCircle },
  { label: 'LinkedIn', href: profile.social.linkedin, Icon: Linkedin },
  { label: 'Instagram', href: profile.social.instagram, Icon: Instagram },
];

const Footer: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();

  return (
    <footer className="site-footer" ref={revealRef}>
      <div className="site-footer__card m-support" data-reveal>
        <div className="site-footer__grid">
          <div className="footer-identity">
            <div className="footer-identity__head">
              <span className="footer-identity__avatar">
                <img src="/images/hashem-profile.webp" alt="" loading="lazy" decoding="async" />
              </span>
              <div>
                <p className="footer-identity__name">Hashem Kayyali</p>
                <p className="footer-identity__role">{profile.role}</p>
              </div>
            </div>
            <p className="footer-identity__status">{profile.freelanceStatus}</p>
            <div className="footer-socials">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <p className="footer-heading">Navigate</p>
            <div className="footer-nav__links">
              {sections.map((section) => (
                <a key={section.href} href={section.href}>
                  {section.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="footer-reach">
            <p className="footer-heading">Reach</p>
            <a className="footer-reach__row" href={profile.social.email}>
              <Mail size={15} aria-hidden="true" />
              <span>{profile.email}</span>
            </a>
            <a className="footer-reach__row" href={`tel:${profile.whatsapp}`}>
              <Phone size={15} aria-hidden="true" />
              <span>{profile.phone}</span>
            </a>
            <p className="footer-reach__row footer-reach__row--static">
              <MapPin size={15} aria-hidden="true" />
              <span>{profile.location}</span>
            </p>
          </div>
        </div>

        <div className="site-footer__base">
          <p>© {new Date().getFullYear()} Hashem Kayyali. All rights reserved.</p>
          <p className="site-footer__colophon">Built with React, TypeScript and Vite</p>
          <a className="site-footer__top" href="#home" aria-label="Back to top">
            <ArrowUp size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
