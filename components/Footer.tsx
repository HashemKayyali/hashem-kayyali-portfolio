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
import { PROFILE_IMAGE, profile } from '../data/profile';
import { useI18n } from '../i18n/useI18n';

/**
 * Closing panel. It carries no animated field of its own: it is the same
 * floating liquid-glass card as the sidebar and the pinned section headers, so
 * the page ends on the chrome it has been navigated by rather than on a fourth
 * kind of surface.
 */
const SECTION_HREFS = ['#home', '#about', '#resume', '#portfolio', '#services', '#contact'];

const Footer: React.FC = () => {
  const { t } = useI18n();
  const revealRef = useReveal<HTMLElement>();

  const socials = [
    { label: t.contact.index.email, href: profile.social.email, Icon: Mail },
    { label: t.contact.actions.whatsapp, href: profile.social.whatsapp, Icon: MessageCircle },
    { label: t.contact.index.linkedin, href: profile.social.linkedin, Icon: Linkedin },
    { label: t.contact.index.instagram, href: profile.social.instagram, Icon: Instagram },
  ];

  return (
    <footer className="site-footer" ref={revealRef}>
      <div className="site-footer__card m-support" data-reveal>
        <div className="site-footer__grid">
          <div className="footer-identity">
            <div className="footer-identity__head">
              <span className="footer-identity__avatar">
                <img src={PROFILE_IMAGE} alt="" loading="lazy" decoding="async" />
              </span>
              <div>
                <p className="footer-identity__name">{t.identity.name}</p>
                <p className="footer-identity__role">{t.footer.role}</p>
              </div>
            </div>
            <p className="footer-identity__status">{t.contact.eyebrow}</p>
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

          <nav className="footer-nav" aria-label={t.footer.pageSections}>
            <p className="footer-heading">{t.footer.pageSections}</p>
            <div className="footer-nav__links">
              {t.footer.navigation.map((entry, index) => (
                <a key={entry.number} href={SECTION_HREFS[index]}>
                  {entry.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="footer-reach">
            <p className="footer-heading">{t.contact.title}</p>
            {/* Addresses and numbers stay LTR inside Arabic. */}
            <a className="footer-reach__row" href={profile.social.email}>
              <Mail size={15} aria-hidden="true" />
              <span dir="ltr">{profile.email}</span>
            </a>
            <a className="footer-reach__row" href={`tel:${profile.whatsapp}`}>
              <Phone size={15} aria-hidden="true" />
              <span dir="ltr">{profile.phone}</span>
            </a>
            <p className="footer-reach__row footer-reach__row--static">
              <MapPin size={15} aria-hidden="true" />
              <span>{t.identity.location}</span>
            </p>
          </div>
        </div>

        <div className="site-footer__base">
          {/* Latin throughout, so it keeps its own direction: bidi would other-
              wise move the © to the end of the line inside Arabic. */}
          <p dir="ltr">© {new Date().getFullYear()} {t.footer.copyrightName}</p>
          <a className="site-footer__top" href="#home" aria-label={t.footer.backToTop}>
            <ArrowUp size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
