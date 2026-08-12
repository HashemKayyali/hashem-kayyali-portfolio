import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'mist' | 'burgundy';
  /**
   * Renders alongside the heading inside one sticky block that stays visible
   * while the section body scrolls. Its measured height is published as
   * `--section-controls-height` so sticky content below can offset itself.
   */
  stickyControls?: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  subtitle,
  children,
  className = '',
  variant = 'white',
  stickyControls,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const hasStickyControls = Boolean(stickyControls);

  // Filter chips wrap differently per viewport, so the offset comes from the
  // real rendered height. Observed, never polled on scroll.
  useEffect(() => {
    if (!hasStickyControls) return;
    const controls = controlsRef.current;
    const section = sectionRef.current;
    if (!controls || !section) return;

    const update = () => {
      section.style.setProperty(
        '--section-controls-height',
        `${Math.round(controls.getBoundingClientRect().height)}px`,
      );
    };

    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(controls);
    return () => observer.disconnect();
  }, [hasStickyControls]);

  const variantClasses = {
    white: 'bg-white text-primary',
    mist: 'bg-mist text-primary',
    burgundy: 'bg-transparent text-white',
  }[variant];

  const heading = (
    <>
      {title && <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl xl:text-5xl">{title}</h2>}
      <div className={`mt-5 h-1 w-20 ${variant === 'burgundy' ? 'bg-white' : 'bg-primary'}`} />
      {subtitle && (
        <p className={`mt-5 text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 ${variant === 'burgundy' ? 'text-white/75' : 'text-primary/70'}`}>
          {subtitle}
        </p>
      )}
    </>
  );

  return (
    <section ref={sectionRef} id={id} className={`content-section${hasStickyControls ? ' content-section--sticky' : ''} relative max-w-full overflow-x-clip scroll-mt-6 px-4 py-16 sm:px-8 sm:py-20 lg:px-10 xl:px-12 xl:py-20 2xl:px-16 2xl:py-24 ${variantClasses} ${className}`}>
      <div className="mx-auto w-full max-w-[1180px] min-w-0 2xl:max-w-[1240px]">
        {hasStickyControls ? (
          // No entrance animation: this block is persistent UI, so it must never
          // depend on animation frames to be visible.
          <div ref={controlsRef} className="section-sticky">
            {(title || subtitle) && <header className="section-sticky__heading">{heading}</header>}
            {stickyControls}
          </div>
        ) : (
          (title || subtitle) && (
            <motion.header
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-90px' }}
              transition={{ duration: 0.55 }}
              className="mb-10 max-w-3xl sm:mb-12 xl:mb-14"
            >
              {heading}
            </motion.header>
          )
        )}
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
