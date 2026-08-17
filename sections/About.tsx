import React from 'react';
import { Code2, Cpu, Database, Layers3, Smartphone } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { useReveal } from '../components/useReveal';
import { ABOUT_STORY_RAMP, profile } from '../data/profile';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { useI18n } from '../i18n/useI18n';

const iconMap = [Code2, Smartphone, Database, Cpu, Layers3];

const About: React.FC = () => {
  const { t } = useI18n();
  const revealRef = useReveal<HTMLDivElement>();
  const metaRef = useReveal<HTMLDivElement>();

  return (
  <SectionWrapper
    id="about"
    title={t.about.title}
    subtitle={t.about.subtitle}
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
          ramp={ABOUT_STORY_RAMP}
        />
        <div className="about__story-body">
          <p>{t.about.story1}</p>
          <p>{t.about.story2}</p>
        </div>
        <div className="about__roles">
          <p className="about__roles-label">{t.about.engineeringFocusTitle}</p>
          <div className="about__roles-list">
            {t.about.engineeringFocus.map((focus) => (
              <span key={focus}>{focus}</span>
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
          <h3>{t.about.toolkitTitle}</h3>
          <p>{t.about.toolkitIntro}</p>
        </div>

        <div className="about__toolkit" aria-label={t.about.toolkitAria}>
          {t.about.skillCategories.map((category, index) => {
            const Icon = iconMap[index] ?? Layers3;
            return (
              <section key={category} className="toolkit-card">
                <div className="toolkit-card__head">
                  <span className="toolkit-card__icon" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <h4>{category}</h4>
                </div>
                <ul className="toolkit-card__items">
                  {(t.about.skills[index] ?? []).map((item) => (
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
      <Info label={t.about.metadataLabels.location} value={t.identity.location} />
      <Info label={t.about.metadataLabels.currentRole} value={t.resume.experience[0].role ?? t.identity.role} />
      <Info label={t.about.metadataLabels.email} value={profile.email} href={profile.social.email} />
      <Info label={t.about.metadataLabels.focus} value={t.about.focusValue} />
    </div>
  </SectionWrapper>
  );
};

const Info = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="about__meta-item">
    <p>{label}</p>
    {/* An address stays LTR inside Arabic: it is a machine identifier, not prose. */}
    {href ? <a href={href} dir="ltr">{value}</a> : <span>{value}</span>}
  </div>
);

export default About;
