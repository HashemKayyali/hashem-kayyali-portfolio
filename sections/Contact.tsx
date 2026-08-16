import React from 'react';
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { useReveal } from '../components/useReveal';
import { profile } from '../data/profile';
import type { WarpRamp } from '../types';

/**
 * The closing plate gets its own palette rather than the shared Burgundy field:
 * a cool green lit inside the ink. It is the one surface on the page whose
 * subject is availability, and green is what the availability marker on it
 * means — so the card and its status badge are lit by the same colour.
 */
const OPEN_RAMP: WarpRamp = ['#04120c', '#0d6047', '#000000', '#23a077', '#dcf2e7'];

/**
 * Closing section. Everything a recruiter needs to act is stated once: whether
 * he is available, where he is, the two direct channels, and the full contact
 * index — so the section answers "how do I reach him" without a scroll back.
 */
const channels = [
  { icon: Mail, label: 'Email', value: profile.email, href: profile.social.email },
  { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.whatsapp}` },
  { icon: MapPin, label: 'Location', value: profile.location },
  { icon: Linkedin, label: 'LinkedIn', value: 'hashem-kayyali', href: profile.social.linkedin },
  { icon: Instagram, label: 'Instagram', value: '@hashemkayyali', href: profile.social.instagram },
];

const Contact: React.FC = () => {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <SectionWrapper
      id="contact"
      title="Let's Work Together"
      subtitle="I am interested in software engineering, R&D product engineering, mobile, full-stack, and IoT opportunities."
      variant="burgundy"
      stickyHeader
    >
      <div className="contact" ref={revealRef}>
        {/* The one ink monolith on the page: the last surface a reader meets, so
            it is the darkest, with the animated Burgundy showing only through
            it rather than around it. */}
        <article className="contact__pitch m-primary" data-reveal>
          <BurgundyWarpBackground
            index={11}
            className="contact__warp"
            overlayOpacity={0.6}
            speedMultiplier={0.7}
            ramp={OPEN_RAMP}
          />

          <p className="contact__status">
            <span className="contact__pulse" aria-hidden="true" />
            {profile.freelanceStatus}
          </p>

          <h3>Have a role or product challenge in mind?</h3>
          <p className="contact__lead">
            Reach me directly by email or WhatsApp. I am based in {profile.location} and open to
            discussing software, product, and connected-system opportunities.
          </p>

          <div className="contact__actions">
            <a className="contact__cta contact__cta--primary" href={profile.social.email}>
              <Mail size={17} aria-hidden="true" /> Email Me
            </a>
            <a
              className="contact__cta"
              href={profile.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </article>

        {/* One panel of hairline-divided rows, not five floating pills — the
            same index pattern the toolkit uses, so it reads as the same site. */}
        <ul
          className="contact__index m-support"
          data-reveal
          style={{ '--reveal-delay': '110ms' } as React.CSSProperties}
          aria-label="Contact details"
        >
          {channels.map(({ icon: Icon, label, value, href }) => {
            const external = href?.startsWith('http');
            const body = (
              <>
                <span className="contact-row__icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="contact-row__body">
                  <span className="contact-row__label">{label}</span>
                  <span className="contact-row__value">{value}</span>
                </span>
                {href && <ArrowUpRight className="contact-row__go" size={15} aria-hidden="true" />}
              </>
            );

            return (
              <li key={label}>
                {href ? (
                  <a
                    className="contact-row"
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    {body}
                  </a>
                ) : (
                  <div className="contact-row">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
