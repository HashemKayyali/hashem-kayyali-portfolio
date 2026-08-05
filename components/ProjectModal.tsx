import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LockKeyhole,
  X,
  ZoomIn,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const buildProjectImages = (project: Project | null): string[] => {
  if (!project) return [];
  return Array.from(new Set([project.image, ...project.gallery]));
};

const thumbnailFor = (image: string): string =>
  image.startsWith('/projects/')
    ? image.replace(/\/([^/]+)$/, '/thumbs/$1')
    : image;

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const candidateImages = useMemo(() => buildProjectImages(project), [project]);
  const [availableImages, setAvailableImages] = useState<string[]>(candidateImages);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setAvailableImages(candidateImages);
    setActiveImage(0);
    setIsLightboxOpen(false);
  }, [candidateImages]);

  useEffect(() => {
    if (activeImage >= availableImages.length) {
      setActiveImage(Math.max(availableImages.length - 1, 0));
    }

    if (availableImages.length === 0) {
      setIsLightboxOpen(false);
    }
  }, [activeImage, availableImages.length]);

  useEffect(() => {
    if (!project) return;

    const previousOverflow = document.body.style.overflow;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
        return;
      }

      if (availableImages.length <= 1) return;

      if (event.key === 'ArrowRight') {
        setActiveImage((value) => (value + 1) % availableImages.length);
      }

      if (event.key === 'ArrowLeft') {
        setActiveImage((value) =>
          (value - 1 + availableImages.length) % availableImages.length,
        );
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [project, onClose, availableImages.length, isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    lightboxCloseButtonRef.current?.focus();
  }, [isLightboxOpen]);

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

  const showPreviousImage = () => {
    if (availableImages.length <= 1) return;
    setActiveImage((value) =>
      (value - 1 + availableImages.length) % availableImages.length,
    );
  };

  const showNextImage = () => {
    if (availableImages.length <= 1) return;
    setActiveImage((value) => (value + 1) % availableImages.length);
  };

  const currentImage = availableImages[activeImage];

  const modal = (
    <>
      <AnimatePresence>
        {project && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-primary/85 p-3 backdrop-blur-sm md:p-6 2xl:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) =>
              event.target === event.currentTarget && onClose()
            }
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} project details`}
          >
            <motion.article
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="custom-scrollbar max-h-[94svh] w-full max-w-[1120px] overflow-y-auto rounded-[1.5rem] bg-white shadow-panel 2xl:max-w-6xl 2xl:rounded-[1.75rem]"
            >
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-silver/35 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 2xl:px-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-silver">
                    {project.category}
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-extrabold text-primary md:text-2xl">
                    {project.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-primary/20 p-3 text-primary transition hover:bg-primary hover:text-white"
                  aria-label="Close project details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid items-start xl:grid-cols-[1.04fr_0.96fr]">
                <div className="self-start bg-mist p-4 sm:p-6 2xl:p-8">
                  {currentImage ? (
                    <>
                      <div className="relative overflow-hidden rounded-2xl bg-primary shadow-soft">
                        <button
                          type="button"
                          className="project-modal__image-trigger"
                          onClick={() => setIsLightboxOpen(true)}
                          aria-label={`Open ${project.title} image ${activeImage + 1} in full screen`}
                        >
                          <img
                            src={currentImage}
                            alt={`${project.title} project image ${activeImage + 1}`}
                            className="aspect-[16/10] w-full object-cover"
                            decoding="async"
                            fetchPriority="high"
                            onError={() => removeMissingImage(currentImage)}
                          />
                          <span className="project-modal__zoom-hint" aria-hidden="true">
                            <ZoomIn size={19} />
                            View full image
                          </span>
                        </button>

                        <div className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1.5 text-xs font-bold text-primary shadow-soft backdrop-blur-sm">
                          {activeImage + 1} / {availableImages.length}
                        </div>

                        {availableImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={showPreviousImage}
                              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-3 text-primary shadow-soft transition hover:scale-105 hover:bg-white"
                              aria-label="Previous project image"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              type="button"
                              onClick={showNextImage}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-3 text-primary shadow-soft transition hover:scale-105 hover:bg-white"
                              aria-label="Next project image"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-3">
                        {availableImages.map((image, index) => (
                          <button
                            type="button"
                            key={image}
                            onClick={() => setActiveImage(index)}
                            className={`relative overflow-hidden rounded-xl border-2 bg-white shadow-sm transition ${
                              activeImage === index
                                ? 'border-primary opacity-100'
                                : 'border-transparent opacity-65 hover:opacity-100'
                            }`}
                            aria-label={`Show project image ${index + 1}`}
                            aria-current={activeImage === index ? 'true' : undefined}
                          >
                            <img
                              src={thumbnailFor(image)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="aspect-video w-full object-cover"
                              onError={(event) => {
                                const thumbnail = event.currentTarget;
                                if (
                                  thumbnail.dataset.fallbackApplied === 'true'
                                ) {
                                  thumbnail.style.display = 'none';
                                  return;
                                }
                                thumbnail.dataset.fallbackApplied = 'true';
                                thumbnail.src = image;
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-primary/15 bg-white text-sm font-semibold text-primary/55">
                      Add cover.webp or screenshot-01.webp to this project folder.
                    </div>
                  )}
                </div>

                <div className="space-y-6 p-5 sm:p-7 2xl:space-y-8 2xl:p-10">
                  <div>
                    <p className="text-base leading-7 text-primary/75 2xl:text-lg 2xl:leading-8">
                      {project.longDescription}
                    </p>
                    <p className="mt-5 border-l-4 border-primary pl-5 font-semibold leading-7 text-primary">
                      {project.stakeholderValue}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-heading text-lg font-extrabold text-primary">
                      My role
                    </h4>
                    <p className="mt-3 leading-7 text-primary/70">
                      {project.role}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-heading text-lg font-extrabold text-primary">
                      Key features
                    </h4>
                    <ul className="mt-3 grid gap-2 text-sm text-primary/75 sm:grid-cols-2">
                      {project.features.map((feature) => (
                        <li
                          key={feature}
                          className="border-b border-silver/35 py-2"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 border-t border-silver/35 pt-6">
                    <span className="text-sm font-semibold text-primary/60">
                      {project.status}
                    </span>
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-deep"
                      >
                        Visit live project <ExternalLink size={17} />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60">
                        <LockKeyhole size={17} /> Private source code
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {project && isLightboxOpen && currentImage && (
          <motion.div
            className="project-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(event) =>
              event.target === event.currentTarget && setIsLightboxOpen(false)
            }
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} image viewer`}
          >
            <button
              ref={lightboxCloseButtonRef}
              type="button"
              className="project-lightbox__close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close image viewer"
            >
              <X size={24} />
            </button>

            {availableImages.length > 1 && (
              <button
                type="button"
                className="project-lightbox__nav project-lightbox__nav--previous"
                onClick={showPreviousImage}
                aria-label="Previous project image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            <motion.figure
              key={currentImage}
              className="project-lightbox__figure"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              <img
                src={currentImage}
                alt={`${project.title} project image ${activeImage + 1} of ${availableImages.length}`}
                decoding="async"
                onError={() => removeMissingImage(currentImage)}
              />
              <figcaption>
                <span>{project.title}</span>
                <span>
                  {activeImage + 1} / {availableImages.length}
                </span>
              </figcaption>
            </motion.figure>

            {availableImages.length > 1 && (
              <button
                type="button"
                className="project-lightbox__nav project-lightbox__nav--next"
                onClick={showNextImage}
                aria-label="Next project image"
              >
                <ChevronRight size={30} />
              </button>
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
