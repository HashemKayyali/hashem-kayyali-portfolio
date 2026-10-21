import React from 'react';
import { Download, FileText, GraduationCap } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { useReveal } from '../components/useReveal';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { RESUME_PDF } from '../data/profile';
import { projectAssets } from '../data/projectAssets';
import { useI18n } from '../i18n/useI18n';
import ExperienceTimeline from '../components/ExperienceTimeline';

/** Profile and downloads frame a lightweight, grouped career timeline. */
const Resume: React.FC = () => {
  const { t } = useI18n();

  // The profile and support column retain their existing entrance. Career
  // information is visible immediately, without role-by-role observers.
  const profileRef = useReveal<HTMLDivElement>();
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
        <div className="resume-profile__body m-beats">
          <p className="resume-profile__eyebrow">{t.resume.profileEyebrow}</p>
          <h3 className="resume-profile__headline">{t.resume.profileHeadline}</h3>
          <p className="resume-profile__summary">{t.resume.profileSummary}</p>
        </div>

        <div className="resume-profile__metrics m-beats">
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
        <div className="resume-layout__main">
          <header className="journey__head">
            <h3 id="professional-journey-title">{t.resume.journeyTitle}</h3>
            <p>{t.resume.journeySupport}</p>
          </header>

          <ExperienceTimeline
            entries={t.resume.experience}
            detailsLabel={t.resume.roleDetails}
            labelledBy="professional-journey-title"
          />
        </div>

        <aside className="resume-layout__aside" ref={asideRef}>
          {/* Feature card: the section's single call to action. */}
          <div className="resume-download m-target m-beats" data-reveal>
            <BurgundyWarpBackground index={10} className="-z-10" overlayOpacity={0.16} />
            <span className="resume-download__icon" aria-hidden="true">
              <FileText size={19} />
            </span>
            <h3>{t.resume.downloadCard.title}</h3>
            <p>{t.resume.downloadCard.copy}</p>
            <div className="resume-download__actions m-beats m-beats--inline m-beats--tight">
              <a href={RESUME_PDF} download className="resume-btn resume-btn--primary">
                <Download size={16} aria-hidden="true" /> {t.resume.downloadCard.pdf}
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
            <p className="resume-card__note">{t.resume.education.university}</p>
            <p className="resume-card__note">{t.resume.education.period}</p>
            <p className="resume-card__note">{t.resume.education.status}</p>
          </div>

          <div className="resume-card m-support" data-reveal style={delay(110)}>
            <p className="resume-card__eyebrow">{t.resume.coreStrengths.title}</p>
            <ul className="resume-strengths m-beats m-beats--inline m-beats--tight">
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
