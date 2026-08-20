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
import type { ProjectView } from '../data/projectAssets';
import { pauseSmoothScroll, resumeSmoothScroll } from './smoothScroll';
import { format, useI18n } from '../i18n/useI18n';

interface ProjectModalProps {
  project: ProjectView | null;
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

const buildProjectImages = (project: ProjectView | null): string[] => {
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
  const { t } = useI18n();
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
      aria-label={t.projectModal.labels.screenshots}
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
          aria-label={format(t.projectModal.a11y.showImage, {
            index: index + 1,
            count: images.length,
          })}
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
  const { t, dir } = useI18n();
  const labels = t.projectModal.labels;
  const isRtl = dir === 'rtl';

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

      // The strip runs in reading order, so the arrow that moves along it
      // reverses with the direction of the page.
      if (event.key === 'ArrowRight') (isRtl ? showPreviousImage : showNextImage)();
      if (event.key === 'ArrowLeft') (isRtl ? showNextImage : showPreviousImage)();
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
  }, [project, onClose, isViewerOpen, showNextImage, showPreviousImage, isRtl]);

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

    // Dragging the content leftwards advances in LTR and rewinds in RTL: the
    // gesture follows the images, and the images run in reading order.
    const forward = isRtl ? distance > 0 : distance < 0;
    if (forward) showNextImage();
    else showPreviousImage();
  };

  const currentImage = availableImages[activeImage];
  const hasMultiple = imageCount > 1;
  const copy = project?.copy;

  /* The chevrons point outward along the reading axis, so they swap with it. */
  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const modal = (
    <>
      <AnimatePresence>
        {project && copy && (
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
            aria-label={format(t.projectModal.a11y.caseStudy, { title: copy.title })}
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
                  <span className="project-detail__eyebrow">{copy.category}</span>
                  <h3 className="project-detail__title">{copy.title}</h3>
                  <p className="project-detail__status">{copy.status}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="project-detail__close"
                  aria-label={labels.closeDetails}
                >
                  <X size={19} />
                </button>
              </header>

              {/* Its own scroller: Lenis must not take the wheel here. */}
              <div className="project-detail__body" data-lenis-prevent>
                {/* Media column. On desktop this is one sticky block — images,
                    thumbnails, then the project's single action — so the column
                    ends on something deliberate instead of trailing off into an
                    empty half of the modal. Below the split it becomes
                    `display: contents` and the action is ordered last, keeping
                    the mobile reading order: images, case study, then act. */}
                <div className="project-detail__media-col">
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
                          aria-label={format(t.projectModal.a11y.openImageFullScreen, {
                            index: activeImage + 1,
                          })}
                        >
                          <img
                            className="project-stage__image"
                            src={currentImage}
                            alt={format(t.projectModal.a11y.screenshot, {
                              title: copy.title,
                              index: activeImage + 1,
                            })}
                            decoding="async"
                            fetchPriority="high"
                            onError={() => removeMissingImage(currentImage)}
                          />
                        </button>

                        <span className="project-stage__hint" aria-hidden="true">
                          <Maximize2 size={14} />
                          {labels.expand}
                        </span>
                        <span className="project-stage__count" aria-live="polite" dir="ltr">
                          {activeImage + 1} / {availableImages.length}
                        </span>

                        {hasMultiple && (
                          <>
                            <button
                              type="button"
                              className="project-stage__nav project-stage__nav--previous"
                              onClick={showPreviousImage}
                              aria-label={labels.previousImage}
                            >
                              <PreviousIcon size={20} />
                            </button>
                            <button
                              type="button"
                              className="project-stage__nav project-stage__nav--next"
                              onClick={showNextImage}
                              aria-label={labels.nextImage}
                            >
                              <NextIcon size={20} />
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
                    // Never a developer instruction: a visitor who reaches this
                    // is told the images are unavailable, and nothing more.
                    <div className="project-stage project-stage--empty">
                      {labels.imageUnavailable}
                    </div>
                  )}
                </section>

                <div className="project-detail__actions">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-detail__cta"
                    >
                      {labels.visitLive}
                      <ExternalLink className="project-detail__cta-icon" size={16} />
                    </a>
                  ) : (
                    <span className="project-detail__private">
                      <LockKeyhole size={15} /> {labels.privateProject}
                    </span>
                  )}
                </div>
                </div>

                {/* The case study proper. Labelled prose blocks in one reading
                    order on mobile; the two shorter blocks pair up on desktop. */}
                <section className="project-detail__content case-study m-beats">
                  <div className="case-study__block case-study__block--lede">
                    <h4 className="case-study__label">{labels.overview}</h4>
                    <p className="case-study__lede">{copy.overview}</p>
                  </div>

                  <div className="case-study__block">
                    <h4 className="case-study__label">{labels.purpose}</h4>
                    <p>{copy.purpose}</p>
                  </div>

                  {/* Contribution and Engineering pair up where there is width
                      for two readable measures. Source order is the approved
                      order, so the reading sequence is the same whether they
                      sit side by side or stack. */}
                  <div className="case-study__pair">
                    <div className="case-study__block">
                      <h4 className="case-study__label">{labels.contribution}</h4>
                      <p>{copy.contribution}</p>
                    </div>

                    <div className="case-study__block">
                      <h4 className="case-study__label">{labels.engineering}</h4>
                      <p>{copy.engineering}</p>
                    </div>
                  </div>

                  <div className="case-study__block">
                    <h4 className="case-study__label">{labels.capabilities}</h4>
                    <ul className="case-study__capabilities">
                      {copy.capabilities.map((capability) => (
                        <li key={capability}>
                          <span aria-hidden="true" />
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Held on its own surface: engineering trade-offs are a
                      different kind of statement from the product copy above. */}
                  <div className="case-study__block case-study__considerations">
                    <h4 className="case-study__label">{labels.considerations}</h4>
                    <ul>
                      {copy.considerations.map((consideration) => (
                        <li key={consideration}>{consideration}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="case-study__block">
                    <h4 className="case-study__label">{labels.technology}</h4>
                    <div className="case-study__tech">
                      {copy.technology.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {project && copy && isViewerOpen && currentImage && (
          <motion.div
            className="project-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_DETAIL, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label={format(t.projectModal.a11y.imageViewer, { title: copy.title })}
          >
            <header className="project-viewer__bar">
              <div className="project-viewer__caption">
                <span>{copy.title}</span>
                <span dir="ltr">
                  {activeImage + 1} / {availableImages.length}
                </span>
              </div>
              <button
                ref={viewerCloseButtonRef}
                type="button"
                className="project-viewer__close"
                onClick={() => setIsViewerOpen(false)}
                aria-label={labels.closeImageViewer}
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
                  aria-label={labels.previousImage}
                >
                  <PreviousIcon size={26} />
                </button>
              )}

              <motion.img
                key={currentImage}
                className="project-viewer__image"
                src={currentImage}
                alt={format(t.projectModal.a11y.screenshotOf, {
                  title: copy.title,
                  index: activeImage + 1,
                  count: availableImages.length,
                })}
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
                  aria-label={labels.nextImage}
                >
                  <NextIcon size={26} />
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
