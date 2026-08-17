import React from 'react';
import { ArrowUpRight, Download, FileText, GraduationCap, MapPin } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { useReveal } from '../components/useReveal';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { experienceAssets, RESUME_DOCX, RESUME_PDF } from '../data/profile';
import { projectAssets } from '../data/projectAssets';
import { useI18n } from '../i18n/useI18n';
import type { ExperienceCopy } from '../content/types';

/**
 * One employer block. It observes itself rather than inheriting the column's
 * reveal, so blocks play as the reader reaches them — which, with the data in
 * newest-first order, walks the record from the current role backwards. The
 * index delay only matters when several are on screen at once (desktop), where
 * it keeps that same order visible as a short cascade.
 */
const JourneyEntry: React.FC<{
  current: boolean;
  index: number;
  children: React.ReactNode;
}> = ({ current, index, children }) => {
  const ref = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={`journey-entry m-journey${current ? ' journey-entry--current' : ''}`}
      data-reveal-self
      style={{ '--reveal-delay': `${index * 50}ms` } as React.CSSProperties}
    >
      {children}
    </li>
  );
};

/**
 * Resume.
 *
 * Composed as employer blocks rather than a timeline: a rail with nodes reads
 * as one continuous track, which misrepresents a record where one employer
 * holds two roles and another is still running. Each employer is one surface
 * that states its own period, and role progression is shown inside the block
 * that owns it.
 *
 * Three tiers of surface keep the section from reading as repeated cards: one
 * primary profile sheet, the journey as the main column, and a support column
 * of quieter cards. Only the two highest-emphasis surfaces — the metric tile
 * and the download card — carry the animated Burgundy.
 */
const Resume: React.FC = () => {
  const { t } = useI18n();

  // Three reveal groups, so each band of the section plays as it is reached
  // rather than all at once from the top.
  const profileRef = useReveal<HTMLDivElement>();
  const journeyRef = useReveal<HTMLDivElement>();
  const asideRef = useReveal<HTMLElement>();

  const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as React.CSSProperties;

  return (
    <SectionWrapper
      id="resume"
      title={t.resume.title}
      subtitle={t.resume.subtitle}
      variant="burgundy"
      stickyHeader
    >
      {/* Primary sheet: the one place the whole profile is stated at once. */}
      <div className="resume-profile m-primary" ref={profileRef} data-reveal>
        <div className="resume-profile__body">
          <p className="resume-profile__eyebrow">{t.resume.profileEyebrow}</p>
          <h3 className="resume-profile__headline">{t.resume.profileHeadline}</h3>
          <p className="resume-profile__summary">{t.resume.profileSummary}</p>
        </div>

        <div className="resume-profile__metrics">
          <div className="resume-metric resume-metric--feature">
            <BurgundyWarpBackground index={9} className="-z-10" overlayOpacity={0.16} />
            <p className="resume-metric__value">{projectAssets.length}</p>
            <p className="resume-metric__label">{t.resume.metricLabels.selectedProjects}</p>
          </div>
          <div className="resume-metric">
            <p className="resume-metric__value">{t.about.skills.length}</p>
            <p className="resume-metric__label">{t.resume.metricLabels.engineeringDomains}</p>
          </div>
        </div>
      </div>

      <div className="resume-layout">
        <div className="resume-layout__main" ref={journeyRef}>
          <header className="journey__head m-support" data-reveal>
            <h3>{t.resume.journeyTitle}</h3>
            <p>{t.resume.journeySupport}</p>
          </header>

          <ol className="journey">
            {t.resume.experience.map((entry: ExperienceCopy, index) => {
              const asset = experienceAssets[index];
              const current = Boolean(entry.badge);

              return (
                <JourneyEntry key={entry.company} current={current} index={index}>
                  <article className="journey-card">
                    {asset && (
                      <BurgundyWarpBackground
                        index={20 + index}
                        className="journey-card__warp"
                        /* Raised from 0.6 (0.7 is the component's cap): the
                           field is atmosphere behind a block of case text, not
                           a display surface like the capability cards. */
                        overlayOpacity={0.68}
                        ramp={asset.warpRamp}
                      />
                    )}

                    <div className="journey-card__head">
                      {asset && (
                        <figure className="journey-card__photo">
                          <img
                            src={asset.image}
                            alt={t.ui.alt[asset.altKey]}
                            loading="lazy"
                            decoding="async"
                          />
                        </figure>
                      )}

                      <div className="journey-card__ident">
                        <div className="journey-card__title-row">
                          <p className="journey-card__company">{entry.company}</p>
                          {entry.badge && (
                            <span className="journey-card__badge">{entry.badge}</span>
                          )}
                        </div>

                        {entry.role && <h4 className="journey-card__role">{entry.role}</h4>}

                        <p className="journey-card__meta">
                          <span className="journey-card__period">{entry.period}</span>
                          <span className="journey-card__place">
                            <MapPin size={12} aria-hidden="true" />
                            {entry.location}
                          </span>
                          {entry.mode && (
                            <span className="journey-card__mode">{entry.mode}</span>
                          )}
                          {/* The dimensions the role covers, in the same quiet
                              pill as the mode — so the three sit in the row
                              that already carries this entry's metadata rather
                              than adding a band of their own. */}
                          {entry.responsibilities?.map((item) => (
                            <span key={item} className="journey-card__scope">
                              {item}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>

                    {/* One employer, two roles: the progression is shown inside
                        the block that owns it, so it never reads as two jobs. */}
                    {entry.roles && entry.roles.length > 0 && (
                      <ol className="journey-progression">
                        {entry.roles.map((role, roleIndex) => (
                          <li
                            key={role.title}
                            className={
                              roleIndex === entry.roles!.length - 1
                                ? 'journey-progression__step journey-progression__step--latest'
                                : 'journey-progression__step'
                            }
                          >
                            {roleIndex > 0 && (
                              <ArrowUpRight
                                className="journey-progression__arrow"
                                size={14}
                                aria-hidden="true"
                              />
                            )}
                            <span className="journey-progression__title">{role.title}</span>
                            <span className="journey-progression__period">{role.period}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    <ul className="journey-card__points">
                      {entry.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                </JourneyEntry>
              );
            })}
          </ol>
        </div>

        <aside className="resume-layout__aside" ref={asideRef}>
          {/* Feature card: the section's single call to action. */}
          <div className="resume-download m-target" data-reveal>
            <BurgundyWarpBackground index={10} className="-z-10" overlayOpacity={0.16} />
            <span className="resume-download__icon" aria-hidden="true">
              <FileText size={19} />
            </span>
            <h3>{t.resume.downloadCard.title}</h3>
            <p>{t.resume.downloadCard.copy}</p>
            <div className="resume-download__actions">
              <a href={RESUME_PDF} download className="resume-btn resume-btn--primary">
                <Download size={16} aria-hidden="true" /> {t.resume.downloadCard.pdf}
              </a>
              <a href={RESUME_DOCX} download className="resume-btn resume-btn--ghost">
                <Download size={16} aria-hidden="true" /> {t.resume.downloadCard.word}
              </a>
            </div>
            <p className="resume-download__note">
              <span>{t.resume.downloadCard.availability}</span>
            </p>
          </div>

          <div className="resume-card m-support" data-reveal style={delay(60)}>
            <div className="resume-card__head">
              <span className="resume-card__icon" aria-hidden="true">
                <GraduationCap size={16} />
              </span>
              <h3>{t.resume.education.title}</h3>
            </div>
            <p className="resume-card__lead">{t.resume.education.degree}</p>
            <p className="resume-card__note">{t.resume.education.status}</p>
          </div>

          <div className="resume-card m-support" data-reveal style={delay(110)}>
            <p className="resume-card__eyebrow">{t.resume.coreStrengths.title}</p>
            <ul className="resume-strengths">
              {t.resume.coreStrengths.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </SectionWrapper>
  );
};

export default Resume;
