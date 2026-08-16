import React from 'react';
import { Code2, Cpu, Database, Layers3, Smartphone } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { useReveal } from '../components/useReveal';
import { profile, skillGroups } from '../data/profile';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import type { WarpRamp } from '../types';

/** Tested in the colour lab: deep navy and indigo lifting into white. */
const STORY_WARP_RAMP: WarpRamp = ['#ffffff', '#01122d', '#070434', '#f2f2f2', '#d8d8d8'];

const iconMap = [Code2, Smartphone, Database, Cpu, Layers3];

// Two beats instead of three: the same sentences, regrouped so the story reads
// as a denser block. Nothing is added, removed, or reworded.
const sentences = profile.aboutParagraph.split(/(?<=\.)\s+/).filter(Boolean);
const narrative = [sentences.slice(0, 2).join(' '), sentences.slice(2).join(' ')].filter(Boolean);

const About: React.FC = () => {
  const revealRef = useReveal<HTMLDivElement>();
  const metaRef = useReveal<HTMLDivElement>();

  return (
  <SectionWrapper
    id="about"
    title="About Me"
    subtitle="Product-minded engineer across software, connected systems, technical operations, and real-world product delivery."
    variant="burgundy"
    stickyHeader
  >
    <div className="about" ref={revealRef}>
      <article className="about__story m-primary" data-reveal>
        <BurgundyWarpBackground
          index={41}
          className="about__story-warp"
          overlayOpacity={0.6}
          rootMargin="0px"
          ramp={STORY_WARP_RAMP}
        />
        <div className="about__story-body">
          {narrative.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        <div className="about__roles">
          <p className="about__roles-label">Target roles</p>
          <div className="about__roles-list">
            {profile.targetRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
        </div>
      </article>

      <div
        className="about__toolkit-col m-support"
        data-reveal
        style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
      >
        <div className="about__toolkit-head">
          <h3>Technical toolkit</h3>
          <p>
            Mostly Next.js, React Native, and Flutter, supported by backend, automation, and
            embedded technologies.
          </p>
        </div>

        <div className="about__toolkit" aria-label="Technical toolkit matrix">
          {skillGroups.map((group, index) => {
            const Icon = iconMap[index] ?? Layers3;
            return (
              <section key={group.category} className="toolkit-card">
                <div className="toolkit-card__head">
                  <span className="toolkit-card__icon" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <h4>{group.category}</h4>
                </div>
                <ul className="toolkit-card__items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>

    <div className="about__meta m-detail" ref={metaRef} data-reveal>
      <Info label="Location" value={profile.location} />
      <Info label="Email" value={profile.email} href={profile.social.email} />
      <Info label="Phone" value={profile.phone} href={`tel:${profile.whatsapp}`} />
      <Info label="Status" value={profile.freelanceStatus} />
    </div>
  </SectionWrapper>
  );
};

const Info = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="about__meta-item">
    <p>{label}</p>
    {href ? <a href={href}>{value}</a> : <span>{value}</span>}
  </div>
);

export default About;
