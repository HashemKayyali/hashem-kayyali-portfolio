import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LockKeyhole,
  Maximize2,
  X,
} from 'lucide-react';
import { Project } from '../types';
import { pauseSmoothScroll, resumeSmoothScroll } from './smoothScroll';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 45;

/* Mirrors the CSS motion tokens (--motion-ease / --motion-detail /
   --motion-support). Framer Motion cannot read custom properties, so the
   values are duplicated here and must move together with index.css. */
const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION_DETAIL = 0.34;
const DURATION_SUPPORT = 0.42;
/* Content swap, not surface motion: arrowing through a gallery has to feel
   immediate, so it stays well under the token scale. */
const DURATION_IMAGE_SWAP = 0.18;

const buildProjectImages = (project: Project | null): string[] => {
  if (!project) return [];
  return Array.from(new Set([project.image, ...project.gallery]));
};

const thumbnailFor = (image: string): string =>
  image.startsWith('/projects/')
    ? image.replace(/\/([^/]+)$/, '/thumbs/$1')
    : image;

interface ThumbStripProps {
  images: string[];
  activeIndex: number;
  variant: 'panel' | 'viewer';
  onSelect: (index: number) => void;
}

/** One strip, two surfaces: the panel gallery and the full-screen viewer. */
const ThumbStrip: React.FC<ThumbStripProps> = ({
  images,
  activeIndex,
  variant,
  onSelect,
}) => {
  const stripRef = useRef<HTMLDivElement>(null);

  // Long galleries (11 shots) scroll out of the strip, so the active thumb is
  // pulled back into view whenever the selection moves by arrow key or swipe.
  useEffect(() => {
    const active = stripRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    active?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [activeIndex]);

  return (
    <div
      ref={stripRef}
      className={`project-thumbs project-thumbs--${variant}`}
      role="tablist"
      aria-label="Project screenshots"
    >
      {images.map((image, index) => (
        <button
          type="button"
          key={image}
          role="tab"
          data-active={activeIndex === index ? 'true' : undefined}
          aria-selected={activeIndex === index}
          className={`project-thumbs__item${
            activeIndex === index ? ' is-active' : ''
          }`}
          onClick={() => onSelect(index)}
          aria-label={`Show image ${index + 1} of ${images.length}`}
        >
          <img
            src={thumbnailFor(image)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              const thumbnail = event.currentTarget;
              if (thumbnail.dataset.fallbackApplied === 'true') {
                thumbnail.style.visibility = 'hidden';
                return;
              }
              thumbnail.dataset.fallbackApplied = 'true';
              thumbnail.src = image;
            }}
          />
        </button>
      ))}
    </div>
  );
};

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const candidateImages = useMemo(() => buildProjectImages(project), [project]);
  const [availableImages, setAvailableImages] = useState<string[]>(candidateImages);
  const [activeImage, setActiveImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const viewerCloseButtonRef = useRef<HTMLButtonElement>(null);
  const swipeOriginRef = useRef<number | null>(null);

  useEffect(() => {
    setAvailableImages(candidateImages);
    setActiveImage(0);
    setIsViewerOpen(false);
  }, [candidateImages]);

  useEffect(() => {
    if (activeImage >= availableImages.length) {
      setActiveImage(Math.max(availableImages.length - 1, 0));
    }

    if (availableImages.length === 0) {
      setIsViewerOpen(false);
    }
  }, [activeImage, availableImages.length]);

  const imageCount = availableImages.length;

  const showPreviousImage = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImage((value) => (value - 1 + imageCount) % imageCount);
  }, [imageCount]);

  const showNextImage = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImage((value) => (value + 1) % imageCount);
  }, [imageCount]);

  useEffect(() => {
    if (!project) return;

    const previousOverflow = document.body.style.overflow;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isViewerOpen) {
          setIsViewerOpen(false);
        } else {
          onClose();
        }
        return;
      }

      if (event.key === 'ArrowRight') showNextImage();
      if (event.key === 'ArrowLeft') showPreviousImage();
    };

    document.body.style.overflow = 'hidden';
    // Held rather than merely blocked: an interpolation still in flight when
    // the modal opens would keep resolving against a body that can no longer
    // move, and land the page somewhere else on close.
    pauseSmoothScroll();
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [project, onClose, isViewerOpen, showNextImage, showPreviousImage]);

  useEffect(() => {
    if (!isViewerOpen) return;
    viewerCloseButtonRef.current?.focus();
  }, [isViewerOpen]);

  useEffect(() => {
    if (availableImages.length <= 1) return;

    const indexes = [
      (activeImage + 1) % availableImages.length,
      (activeImage - 1 + availableImages.length) % availableImages.length,
    ];

    indexes.forEach((index) => {
      const image = new Image();
      image.src = availableImages[index];
    });
  }, [activeImage, availableImages]);

  const removeMissingImage = (missingImage: string) => {
    setAvailableImages((images) =>
      images.filter((image) => image !== missingImage),
    );
  };

  const onSwipeStart = (event: React.TouchEvent) => {
    swipeOriginRef.current = event.changedTouches[0].clientX;
  };

  const onSwipeEnd = (event: React.TouchEvent) => {
    const origin = swipeOriginRef.current;
    swipeOriginRef.current = null;
    if (origin === null) return;

    const distance = event.changedTouches[0].clientX - origin;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;

    if (distance < 0) showNextImage();
    else showPreviousImage();
  };

  const currentImage = availableImages[activeImage];
  const hasMultiple = imageCount > 1;

  const modal = (
    <>
      <AnimatePresence>
        {project && (
          <motion.div
            className="project-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_DETAIL, ease: EASE }}
            onMouseDown={(event) =>
              event.target === event.currentTarget && onClose()
            }
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} case study`}
          >
            <motion.article
              className="project-detail__panel"
              initial={{ opacity: 0, y: 26, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.985 }}
              transition={{ duration: DURATION_SUPPORT, ease: EASE }}
            >
              <header className="project-detail__head">
                <div className="project-detail__identity">
                  <span className="project-detail__eyebrow">
                    {project.category}
                  </span>
                  <h3 className="project-detail__title">{project.title}</h3>
                  <p className="project-detail__status">{project.status}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="project-detail__close"
                  aria-label="Close project details"
                >
                  <X size={19} />
                </button>
              </header>

              {/* Its own scroller: Lenis must not take the wheel here. */}
              <div className="project-detail__body" data-lenis-prevent>
                <section className="project-detail__gallery">
                  {currentImage ? (
                    <>
                      <div
                        className="project-stage"
                        onTouchStart={onSwipeStart}
                        onTouchEnd={onSwipeEnd}
                      >
                        {/* Blurred fill turns the letterboxing of mixed image
                            ratios into a deliberate surface. */}
                        <img
                          className="project-stage__wash"
                          src={currentImage}
                          alt=""
                          aria-hidden="true"
                          decoding="async"
                        />
                        <button
                          type="button"
                          className="project-stage__trigger"
                          onClick={() => setIsViewerOpen(true)}
                          aria-label={`Open image ${activeImage + 1} full screen`}
                        >
                          <img
                            className="project-stage__image"
                            src={currentImage}
                            alt={`${project.title} screenshot ${activeImage + 1}`}
                            decoding="async"
                            fetchPriority="high"
                            onError={() => removeMissingImage(currentImage)}
                          />
                        </button>

                        <span className="project-stage__hint" aria-hidden="true">
                          <Maximize2 size={14} />
                          Expand
                        </span>
                        <span className="project-stage__count" aria-live="polite">
                          {activeImage + 1} / {availableImages.length}
                        </span>

                        {hasMultiple && (
                          <>
                            <button
                              type="button"
                              className="project-stage__nav project-stage__nav--previous"
                              onClick={showPreviousImage}
                              aria-label="Previous image"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              type="button"
                              className="project-stage__nav project-stage__nav--next"
                              onClick={showNextImage}
                              aria-label="Next image"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </div>

                      {hasMultiple && (
                        <ThumbStrip
                          images={availableImages}
                          activeIndex={activeImage}
                          variant="panel"
                          onSelect={setActiveImage}
                        />
                      )}
                    </>
                  ) : (
                    <div className="project-stage project-stage--empty">
                      Add cover.webp or screenshot-01.webp to this project folder.
                    </div>
                  )}
                </section>

                <section className="project-detail__content">
                  <p className="project-detail__lede">{project.longDescription}</p>

                  <p className="project-detail__value">
                    {project.stakeholderValue}
                  </p>

                  <div className="project-detail__block">
                    <h4>My role</h4>
                    <p>{project.role}</p>
                  </div>

                  <div className="project-detail__block">
                    <h4>Key features</h4>
                    <ul className="project-detail__features">
                      {project.features.map((feature) => (
                        <li key={feature}>
                          <span aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="project-detail__block">
                    <h4>Stack</h4>
                    <div className="project-detail__tech">
                      {project.tech.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>

                  <div className="project-detail__actions">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-detail__cta"
                      >
                        Visit live project <ExternalLink size={16} />
                      </a>
                    ) : (
                      <span className="project-detail__private">
                        <LockKeyhole size={15} /> Private source code
                      </span>
                    )}
                  </div>
                </section>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {project && isViewerOpen && currentImage && (
          <motion.div
            className="project-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_DETAIL, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} image viewer`}
          >
            <header className="project-viewer__bar">
              <div className="project-viewer__caption">
                <span>{project.title}</span>
                <span>
                  {activeImage + 1} / {availableImages.length}
                </span>
              </div>
              <button
                ref={viewerCloseButtonRef}
                type="button"
                className="project-viewer__close"
                onClick={() => setIsViewerOpen(false)}
                aria-label="Close image viewer"
              >
                <X size={20} />
              </button>
            </header>

            <div
              className="project-viewer__stage"
              onMouseDown={(event) =>
                event.target === event.currentTarget && setIsViewerOpen(false)
              }
              onTouchStart={onSwipeStart}
              onTouchEnd={onSwipeEnd}
            >
              {hasMultiple && (
                <button
                  type="button"
                  className="project-viewer__nav project-viewer__nav--previous"
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={26} />
                </button>
              )}

              <motion.img
                key={currentImage}
                className="project-viewer__image"
                src={currentImage}
                alt={`${project.title} screenshot ${activeImage + 1} of ${availableImages.length}`}
                decoding="async"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: DURATION_IMAGE_SWAP, ease: EASE }}
                onError={() => removeMissingImage(currentImage)}
              />

              {hasMultiple && (
                <button
                  type="button"
                  className="project-viewer__nav project-viewer__nav--next"
                  onClick={showNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={26} />
                </button>
              )}
            </div>

            {hasMultiple && (
              <ThumbStrip
                images={availableImages}
                activeIndex={activeImage}
                variant="viewer"
                onSelect={setActiveImage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modal, document.body)
    : null;
};

export default ProjectModal;
