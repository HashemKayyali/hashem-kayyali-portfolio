import React from 'react';
import {
  Download,
  FileText,
  GraduationCap,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { useReveal } from '../components/useReveal';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { experience, profile, projects, skillGroups } from '../data/profile';
import type { ExperienceItem } from '../types';

const focusAreas = [
  'Product ownership',
  'Responsive UI engineering',
  'API & database integration',
  'Real-time connected systems',
  'Embedded hardware integration',
  'Testing & troubleshooting',
];

/**
 * One journey entry. It observes itself rather than inheriting the column's
 * reveal, so entries play as the reader reaches them — which, with the data in
 * newest-first order, walks the timeline from the current role backwards. The
 * index delay only matters when several are on screen at once (desktop), where
 * it keeps that same order visible as a cascade.
 */
const JourneyEntry: React.FC<{
  item: ExperienceItem;
  index: number;
  children: React.ReactNode;
}> = ({ item, index, children }) => {
  const ref = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={`journey-entry m-connect${item.current ? ' journey-entry--current' : ''}`}
      data-reveal-self
      style={{ '--reveal-delay': `${index * 110}ms` } as React.CSSProperties}
    >
      {children}
    </li>
  );
};

/**
 * Resume. Three tiers of surface, so the section reads as designed rather than
 * repeated: one primary profile sheet, the journey rail as the main column, and
 * a support column of quieter cards. Only the two highest-emphasis surfaces
 * (the metric tile and the download card) carry the animated Burgundy.
 */

const Resume: React.FC = () => {
  // Three reveal groups, so each band of the section plays as it is reached
  // rather than all at once from the top.
  const profileRef = useReveal<HTMLDivElement>();
  const journeyRef = useReveal<HTMLDivElement>();
  const asideRef = useReveal<HTMLElement>();

  const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as React.CSSProperties;

  return (
    <SectionWrapper
      id="resume"
      title="Resume"
      subtitle="Recruiter-focused experience, engineering strengths, and a downloadable ATS-friendly resume."
      variant="burgundy"
      stickyHeader
    >
      {/* Primary sheet: the one place the whole profile is stated at once. */}
      <div className="resume-profile m-primary" ref={profileRef} data-reveal>
        <div className="resume-profile__body">
          <p className="resume-profile__eyebrow">Professional profile</p>
          <h3 className="resume-profile__headline">
            Product-minded software engineer and R&amp;D product engineer.
          </h3>
          <p className="resume-profile__summary">
            {profile.professionalSummary} I take products from requirements and interface design
            through implementation, hardware integration, testing, and deployment preparation.
          </p>
        </div>

        <div className="resume-profile__metrics">
          <div className="resume-metric resume-metric--feature">
            <BurgundyWarpBackground index={9} className="-z-10" overlayOpacity={0.16} />
            <p className="resume-metric__value">{projects.length}</p>
            <p className="resume-metric__label">Selected products</p>
          </div>
          <div className="resume-metric">
            <p className="resume-metric__value">{skillGroups.length}</p>
            <p className="resume-metric__label">Engineering domains</p>
          </div>
        </div>
      </div>

      <div className="resume-layout">
        <div className="resume-layout__main" ref={journeyRef}>
          <header className="journey__head m-support" data-reveal>
            <h3>Professional journey</h3>
            <p>Roles, progression, and what each one actually involved.</p>
          </header>

          <ol className="journey">
            {experience.map((item, index) => (
              <JourneyEntry key={`${item.company}-${item.period}`} item={item} index={index}>
                <div className="journey-entry__node">
                  <img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" />
                </div>

                <article className="journey-entry__card">
                  <div className="journey-entry__top">
                    <p className="journey-entry__company">{item.company}</p>
                    <span className="journey-entry__period">{item.period}</span>
                  </div>

                  <h4 className="journey-entry__role">{item.title}</h4>

                  <p className="journey-entry__meta">
                    <MapPin size={13} aria-hidden="true" />
                    <span>{item.location}</span>
                    {item.mode && <span className="journey-entry__mode">{item.mode}</span>}
                    {item.current && <span className="journey-entry__badge">Current role</span>}
                  </p>

                  {item.roles && item.roles.length > 0 && (
                    <ol
                      className="journey-entry__roles"
                      aria-label={`Role progression at ${item.company}`}
                    >
                      {item.roles.map((role) => (
                        <li key={`${role.title}-${role.period}`}>
                          <span className="journey-entry__roles-title">{role.title}</span>
                          <span className="journey-entry__roles-period">{role.period}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <ul className="journey-entry__points">
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </article>
              </JourneyEntry>
            ))}
          </ol>
        </div>

        <aside className="resume-layout__aside" ref={asideRef}>
          {/* Feature card: the section's single call to action. */}
          <div className="resume-download m-target" data-reveal>
            <BurgundyWarpBackground index={10} className="-z-10" overlayOpacity={0.16} />
            <span className="resume-download__icon" aria-hidden="true">
              <FileText size={19} />
            </span>
            <h3>Download resume</h3>
            <p>
              A one-page, ATS-friendly resume built for software engineering, R&amp;D, full-stack,
              mobile, and IoT applications.
            </p>
            <div className="resume-download__actions">
              <a
                href="/resume/hashem-kayyali-resume.pdf"
                download
                className="resume-btn resume-btn--primary"
              >
                <Download size={16} aria-hidden="true" /> Download PDF
              </a>
              <a
                href="/resume/hashem-kayyali-resume.docx"
                download
                className="resume-btn resume-btn--ghost"
              >
                <Download size={16} aria-hidden="true" /> Download Word
              </a>
            </div>
            <p className="resume-download__note">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Clean layout, selectable text, and no unsupported claims.</span>
            </p>
          </div>

          <div className="resume-card m-support" data-reveal style={delay(80)}>
            <div className="resume-card__head">
              <span className="resume-card__icon" aria-hidden="true">
                <GraduationCap size={16} />
              </span>
              <h3>Education</h3>
            </div>
            <p className="resume-card__lead">Software Engineering</p>
            <p className="resume-card__note">Bachelor-level studies currently in progress.</p>
          </div>

          <div className="resume-card m-support" data-reveal style={delay(140)}>
            <p className="resume-card__eyebrow">Core strengths</p>
            <ul className="resume-strengths">
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </SectionWrapper>
  );
};

export default Resume;
