"use client";

import type React from 'react';
import { MoveUpRight } from 'lucide-react';
import { motion, type MotionValue } from 'framer-motion';
import BurgundyWarpBackground from './burgundy-warp-background';
import type { ProjectView } from '../../data/projectAssets';
import { format, useI18n } from '../../i18n/useI18n';

interface FeatureShaderCardProps {
  project: ProjectView;
  index?: number;
  total?: number;
  /** Scroll-linked dim applied while the next card rises over this one. */
  dimOpacity?: MotionValue<number>;
  onClick: () => void;
}

const FeatureShaderCard: React.FC<FeatureShaderCardProps> = ({
  project,
  index = 0,
  total = 0,
  dimOpacity,
  onClick,
}) => {
  const { t } = useI18n();
  const { copy, warpRamp } = project;

  // One canonical card asset: viewport width must never swap in a different crop.
  const cardImage = project.image.endsWith('/cover.webp')
    ? project.image.replace('/cover.webp', '/card-cover.webp')
    : project.image;

  return (
    <article className="project-card">
      <button
        type="button"
        onClick={onClick}
        className="project-card__button"
        aria-label={format(t.projectModal.a11y.caseStudy, { title: copy.title })}
      >
        <div className="project-card__media">
          {/* Covers span 1.33–1.78, so a fixed box crops most of them. The main
              image is contained so the whole cover is visible; this blurred
              copy fills whatever the contain leaves, instead of dead bars.

              Both are decorative: the cover repeats the title and category
              already announced by the button, so naming it again would make a
              screen reader read the card twice. */}
          <img
            className="project-card__media-fill"
            src={cardImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
          <img
            className="project-card__media-main"
            src={cardImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="project-card__body">
          {/* Opt-in per card: without a ramp the body keeps the glass material
              every other card uses. */}
          {warpRamp && (
            <BurgundyWarpBackground
              index={index}
              className="project-card__warp"
              overlayOpacity={0.6}
              rootMargin="90px 0px"
              ramp={warpRamp}
            />
          )}

          <div className="project-card__eyebrow">
            <span className="project-card__category">{copy.category}</span>
            {total > 0 && (
              <span className="project-card__count" dir="ltr">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            )}
          </div>

          <h3 className="project-card__title">{copy.title}</h3>
          <p className="project-card__description">{copy.short}</p>

          <div className="project-card__tech">
            {copy.technology.slice(0, 3).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="project-card__footer">
            <span className="project-card__status">{copy.status}</span>
            <span className="project-card__cta">
              {t.actions.viewProject}
              <MoveUpRight className="project-card__cta-arrow" size={16} />
            </span>
          </div>
        </div>
      </button>

      {dimOpacity && (
        <motion.span
          className="project-card__stack-dim"
          style={{ opacity: dimOpacity }}
          aria-hidden="true"
        />
      )}
    </article>
  );
};

export default FeatureShaderCard;
