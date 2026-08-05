import React from 'react';
import {
  ArrowUp,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
} from 'lucide-react';
import BurgundyWarpBackground from './ui/burgundy-warp-background';
import { profile } from '../data/profile';

const footerLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Resume', href: '#resume' },
  { label: 'Projects', href: '#portfolio' },
  { label: 'Capabilities', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

const Footer: React.FC = () => (
  <footer className="site-footer">
    <BurgundyWarpBackground
      index={14}
      className="site-footer__background"
      overlayOpacity={0.3}
      speedMultiplier={0.72}
      rootMargin="260px 0px"
    />

    <div className="site-footer__inner">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <p className="site-footer__eyebrow">R&D Product Engineer · Software Engineer</p>
          <h2>Building complete products across software and real-world systems.</h2>
          <p>
            Product development, connected systems, technical operations, and practical problem solving from concept to deployment.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer navigation">
          <p className="site-footer__label">Navigate</p>
          <div>
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>
        </nav>

        <div className="site-footer__connect">
          <p className="site-footer__label">Connect</p>
          <div className="site-footer__socials">
            <a href={profile.social.email} aria-label="Email Hashem"><Mail size={19} /></a>
            <a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={19} /></a>
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={19} /></a>
            <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={19} /></a>
          </div>
          <a className="site-footer__email" href={profile.social.email}>{profile.email}</a>
          <a className="site-footer__top" href="#home">
            Back to top <ArrowUp size={17} />
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} Hashem Kayyali. All rights reserved.</p>
        <p>{profile.location} · Open to software engineering and R&D opportunities</p>
      </div>
    </div>
  </footer>
);

export default Footer;
