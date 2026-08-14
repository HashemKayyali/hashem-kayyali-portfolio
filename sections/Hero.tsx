import React from 'react';
import { ArrowRight, Download, MessageCircle } from 'lucide-react';
import { profile } from '../data/profile';

const HEADLINE = 'Building complete products across software and real-world systems.';

/**
 * Headline-led Hero: the portrait sits beside the headline at every width the
 * two fit together, and the copy runs full width beneath. Entrance is CSS-only
 * so the content is readable even if the animation never runs.
 */
const Hero: React.FC = () => (
  <section id="home" className="hero">
    <div className="hero__inner">
      <figure className="hero__figure">
        <img
          src="/images/hashem-profile.webp"
          alt="Hashem Kayyali profile"
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
            rather than eleven fragments. */}
        <span className="sr-only">{HEADLINE}</span>
        <span aria-hidden="true">
          {HEADLINE.split(' ').map((word, index) => (
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

      <p className="hero__role">{profile.role}</p>
      <p className="hero__summary">{profile.tagline}</p>

      <div className="hero__actions">
        <a href="#portfolio" className="hero__cta hero__cta--primary">
          View Projects
          <ArrowRight size={17} aria-hidden="true" />
        </a>
        <a
          href="/resume/hashem-kayyali-resume.pdf"
          download
          className="hero__cta hero__cta--secondary"
        >
          <Download size={17} aria-hidden="true" />
          Download Resume
        </a>
        <a
          href={profile.social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="hero__cta hero__cta--tertiary"
        >
          <MessageCircle size={17} aria-hidden="true" />
          WhatsApp
        </a>
      </div>

      <div className="hero__meta">
        <span>Next.js · React Native · Flutter</span>
        <span>Web · Mobile · Desktop</span>
        <span>ESP32 · Sensors · Real-Time Systems</span>
      </div>
    </div>
  </section>
);

export default Hero;
