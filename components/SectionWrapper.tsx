import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BurgundyWarpBackground from './ui/burgundy-warp-background';
import type { WarpRamp } from '../types';

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
  /** Makes the title + description sticky for sections without extra controls. */
  stickyHeader?: boolean;
  /** Own palette for the pinned header's animated background. */
  warpRamp?: WarpRamp;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  subtitle,
  children,
  className = '',
  variant = 'white',
  stickyControls,
  stickyHeader = false,
  warpRamp,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasStickyControls = Boolean(stickyControls) || stickyHeader;
  const [pinned, setPinned] = useState(false);

  // A pinned header must not blend into the content sliding under it, so it
  // publishes its own pinned state and CSS fades a scrim in beneath it. Driven
  // by a 1px sentinel at the header's resting position — no scroll listener.
  useEffect(() => {
    if (!hasStickyControls) return;
    const sentinel = sentinelRef.current;
    const controls = controlsRef.current;
    if (!sentinel || !controls) return;

    let observer: IntersectionObserver | null = null;

    // The stick offset changes at the desktop breakpoint, so the root margin is
    // re-read rather than assumed.
    const attach = () => {
      observer?.disconnect();
      const stickyTop = Number.parseFloat(getComputedStyle(controls).top) || 0;
      observer = new IntersectionObserver(
        ([entry]) => setPinned(!entry.isIntersecting),
        { rootMargin: `-${Math.max(stickyTop, 0) + 1}px 0px 0px 0px`, threshold: 0 },
      );
      observer.observe(sentinel);
    };

    attach();
    window.addEventListener('resize', attach);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', attach);
    };
  }, [hasStickyControls]);

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
          <>
          <div ref={sentinelRef} className="section-sticky__sentinel" aria-hidden="true" />
          <div
            ref={controlsRef}
            className={`section-sticky${variant === 'burgundy' ? ' section-sticky--glass' : ''}${
              pinned ? ' section-sticky--pinned' : ''
            }`}
          >
            {warpRamp && (
              <BurgundyWarpBackground
                index={40 + (id.charCodeAt(0) % 5)}
                className="section-sticky__warp"
                overlayOpacity={0.6}
                rootMargin="0px"
                ramp={warpRamp}
                /* The header is a wide, short box, so covering it blows one
                   soft patch up ~2.3x. Tightening the field puts the pattern
                   back inside it. */
                density={2.4}
              />
            )}
            {(title || subtitle) && <header className="section-sticky__heading">{heading}</header>}
            {stickyControls}
          </div>
          </>
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
