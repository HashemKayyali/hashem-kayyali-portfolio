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
import { CONTACT_RAMP, profile } from '../data/profile';
import { useI18n } from '../i18n/useI18n';

/**
 * Closing section. The direct channels and the full contact index are stated
 * once, so the section answers "how do I reach him" without a scroll back.
 */
const Contact: React.FC = () => {
  const { t } = useI18n();
  const revealRef = useReveal<HTMLDivElement>();

  // Machine identifiers — addresses, numbers, handles — stay LTR inside Arabic.
  const channels = [
    { icon: Mail, label: t.contact.index.email, value: profile.email, href: profile.social.email, ltr: true },
    { icon: Phone, label: t.contact.index.phone, value: profile.phone, href: `tel:${profile.whatsapp}`, ltr: true },
    { icon: MapPin, label: t.contact.index.location, value: t.identity.location, ltr: false },
    { icon: Linkedin, label: t.contact.index.linkedin, value: profile.linkedinHandle, href: profile.social.linkedin, ltr: true },
    { icon: Instagram, label: t.contact.index.instagram, value: profile.instagramHandle, href: profile.social.instagram, ltr: true },
  ];

  return (
    <SectionWrapper
      id="contact"
      title={t.contact.title}
      subtitle={t.contact.subtitle}
      variant="burgundy"
      stickyHeader
    >
      <div className="contact" ref={revealRef}>
        {/* The one ink monolith on the page: the last surface a reader meets, so
            it is the darkest, with the animated Burgundy showing only through
            it rather than around it. */}
        <article className="contact__pitch m-primary m-beats" data-reveal>
          <BurgundyWarpBackground
            index={11}
            className="contact__warp"
            overlayOpacity={0.6}
            speedMultiplier={0.7}
            ramp={CONTACT_RAMP}
          />

          <p className="contact__status">
            <span className="contact__pulse" aria-hidden="true" />
            {t.contact.eyebrow}
          </p>

          <h3>{t.contact.heading}</h3>
          <p className="contact__lead">{t.contact.supporting}</p>

          <div className="contact__actions m-beats m-beats--inline m-beats--tight">
            <a className="contact__cta contact__cta--primary" href={profile.social.email}>
              <Mail size={17} aria-hidden="true" /> {t.contact.actions.email}
            </a>
            <a
              className="contact__cta"
              href={profile.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={17} aria-hidden="true" /> {t.contact.actions.whatsapp}
            </a>
          </div>
        </article>

        {/* One panel of hairline-divided rows, not five floating pills — the
            same index pattern the toolkit uses, so it reads as the same site. */}
        <ul
          className="contact__index m-support m-beats m-beats--inline m-beats--tight"
          data-reveal
          style={{ '--reveal-delay': '110ms' } as React.CSSProperties}
          aria-label={t.contact.aria}
        >
          {channels.map(({ icon: Icon, label, value, href, ltr }) => {
            const external = href?.startsWith('http');
            const body = (
              <>
                <span className="contact-row__icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="contact-row__body">
                  <span className="contact-row__label">{label}</span>
                  <span className="contact-row__value" dir={ltr ? 'ltr' : undefined}>{value}</span>
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
