import React from 'react';
import { ArrowRight, Download, MessageCircle } from 'lucide-react';
import { PROFILE_IMAGE, profile, RESUME_PDF } from '../data/profile';
import { useI18n } from '../i18n/useI18n';

/**
 * Headline-led Hero: the portrait sits beside the headline at every width the
 * two fit together, and the copy runs full width beneath. Entrance is CSS-only
 * so the content is readable even if the animation never runs.
 */
const Hero: React.FC = () => {
  const { t } = useI18n();
  const headline = t.hero.headline;

  return (
    <section id="home" className="hero">
      <div className="hero__inner">
        <figure className="hero__figure">
          <img
            src={PROFILE_IMAGE}
            alt={t.ui.alt.profile}
            width="900"
            height="900"
            fetchPriority="high"
            decoding="async"
          />
        </figure>

        <h2 className="hero__headline">
          {/* Split per word so each can swing up on its own beat. The full
              sentence stays in the accessibility tree via the sr-only copy, and
              the spans are hidden from it, so screen readers get one heading
              rather than a stream of fragments. Keyed by locale so the stagger
              restarts cleanly when the sentence changes length. */}
          <span className="sr-only">{headline}</span>
          <span aria-hidden="true">
            {headline.split(' ').map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="hero__word"
                style={{ '--word-index': index } as React.CSSProperties}
              >
                {word}
              </span>
            ))}
          </span>
        </h2>

        <p className="hero__role">{t.identity.role}</p>
        <p className="hero__summary">{t.hero.supporting}</p>

        <div className="hero__actions">
          <a href="#portfolio" className="hero__cta hero__cta--primary">
            {t.hero.actions.viewProjects}
            <ArrowRight className="hero__cta-arrow" size={17} aria-hidden="true" />
          </a>
          <a href={RESUME_PDF} download className="hero__cta hero__cta--secondary">
            <Download size={17} aria-hidden="true" />
            {t.hero.actions.downloadResume}
          </a>
          <a
            href={profile.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hero__cta hero__cta--tertiary"
          >
            <MessageCircle size={17} aria-hidden="true" />
            {t.hero.actions.whatsapp}
          </a>
        </div>

        <div className="hero__meta">
          {t.hero.technicalMeta.map((entry) => (
            <span key={entry}>{entry}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
