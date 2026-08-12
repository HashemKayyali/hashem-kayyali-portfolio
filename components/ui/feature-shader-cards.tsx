"use client";

import type React from 'react';
import { MoveUpRight } from 'lucide-react';
import { motion, type MotionValue } from 'framer-motion';
import BurgundyWarpBackground from './burgundy-warp-background';

interface FeatureShaderCardProps {
  title: string;
  category: string;
  description: string;
  status: string;
  image: string;
  tech: string[];
  index?: number;
  total?: number;
  /** Scroll-linked dim applied while the next card rises over this one. */
  dimOpacity?: MotionValue<number>;
  onClick: () => void;
}

const FeatureShaderCard: React.FC<FeatureShaderCardProps> = ({
  title,
  category,
  description,
  status,
  image,
  tech,
  index = 0,
  total = 0,
  dimOpacity,
  onClick,
}) => {
  // One canonical card asset: viewport width must never swap in a different crop.
  const cardImage = image.endsWith('/cover.webp')
    ? image.replace('/cover.webp', '/card-cover.webp')
    : image;

  return (
    <article className="project-card">
      <button
        type="button"
        onClick={onClick}
        className="project-card__button"
        aria-label={`View ${title} case study`}
      >
        <div className="project-card__media">
          <img
            src={cardImage}
            alt={`${title} project cover`}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="project-card__body">
          <BurgundyWarpBackground
            index={index}
            className="project-card__warp"
            overlayOpacity={0.45}
            rootMargin="90px 0px"
          />

          <div className="project-card__eyebrow">
            <span className="project-card__category">{category}</span>
            {total > 0 && (
              <span className="project-card__count">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            )}
          </div>

          <h3 className="project-card__title">{title}</h3>
          <p className="project-card__description">{description}</p>

          <div className="project-card__tech">
            {tech.slice(0, 3).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="project-card__footer">
            <span className="project-card__status">{status}</span>
            <span className="project-card__cta">
              View project
              <MoveUpRight size={16} />
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
