import React from 'react';
import { BriefcaseBusiness, ChevronDown } from 'lucide-react';
import type { ExperienceCopy, ExperienceRoleCopy } from '../content/types';
import { experienceAssets } from '../data/profile';
import './experience-timeline.css';

type RoleContent = Omit<ExperienceRoleCopy, 'employment' | 'mode'> & {
  employment?: string;
  mode?: string;
};

/** The first paragraph and all career facts stay visible when details close. */
const RoleDescription: React.FC<{ points: string[]; detailsLabel: string }> = ({ points, detailsLabel }) => {
  const [introduction, ...details] = points;
  if (!introduction) return null;

  return (
    <div className="experience-role__description">
      <p>{introduction}</p>
      {details.length > 0 && (
        <details className="experience-role__details">
          <summary>
            {detailsLabel}
            <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <div className="experience-role__additional">
            {details.map(point => <p key={point}>{point}</p>)}
          </div>
        </details>
      )}
    </div>
  );
};

/** The same role hierarchy is used for individual and grouped positions. */
const RoleEntry: React.FC<{
  role: RoleContent;
  id: string;
  company?: string;
  location: string;
  badge?: string;
  grouped?: boolean;
  detailsLabel: string;
}> = ({ role, id, company, location, badge, grouped = false, detailsLabel }) => {
  const Heading = grouped ? 'h5' : 'h4';

  return (
    <div className="experience-role">
      <div className="experience-role__heading">
        <Heading id={id} className="experience-role__title">{role.title}</Heading>
        {badge && <span className="experience-role__badge">{badge}</span>}
      </div>
      {(company || role.employment) && (
        <p className="experience-role__association">
          {company && <span>{company}</span>}
          {role.employment && <span>{role.employment}</span>}
        </p>
      )}
      <p className="experience-role__period">{role.period}</p>
      <p className="experience-role__location">
        <span>{location}</span>
        {role.mode && <span>{role.mode}</span>}
      </p>
      <RoleDescription points={role.points} detailsLabel={detailsLabel} />
    </div>
  );
};

/** Logos belong to employers, so a company progression renders one image. */
const CompanyGroup: React.FC<{ entry: ExperienceCopy; detailsLabel: string }> = ({ entry, detailsLabel }) => {
  const asset = experienceAssets[entry.id];
  const grouped = Boolean(entry.roles?.length);
  const headingId = `experience-${entry.id}`;

  return (
    <li className={`experience-company${grouped ? ' experience-company--grouped' : ''}`} data-company={entry.id}>
      <article className="experience-company__layout" aria-labelledby={headingId}>
        <div className="experience-company__logo" aria-hidden="true">
          {asset ? (
            <img
              src={asset.image.replace(/\.webp$/, '-thumb-320.webp')}
              width="44"
              height="44"
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : <BriefcaseBusiness size={22} />}
        </div>
        <div className="experience-company__body">
          {grouped ? (
            <>
              <header className="experience-company__header">
                <h4 id={headingId}>{entry.company}</h4>
                <p className="experience-role__period">{entry.period}</p>
              </header>
              <ol className="experience-roles">
                {entry.roles?.map((role, index) => (
                  <li key={role.title} className="experience-role--grouped">
                    <RoleEntry
                      role={role}
                      id={`${headingId}-${index}`}
                      location={entry.location}
                      grouped
                      detailsLabel={detailsLabel}
                    />
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <RoleEntry
              role={{ title: entry.role ?? entry.company, period: entry.period, employment: entry.employment, mode: entry.mode, points: entry.points }}
              id={headingId}
              company={entry.company}
              location={entry.location}
              badge={entry.badge}
              detailsLabel={detailsLabel}
            />
          )}
        </div>
      </article>
    </li>
  );
};

const ExperienceTimeline: React.FC<{ entries: ExperienceCopy[]; detailsLabel: string; labelledBy: string }> = ({ entries, detailsLabel, labelledBy }) => (
  <ol className="experience-timeline" aria-labelledby={labelledBy}>
    {entries.map(entry => <CompanyGroup key={entry.id} entry={entry} detailsLabel={detailsLabel} />)}
  </ol>
);

export default ExperienceTimeline;
