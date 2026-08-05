import React, { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 8;
const SETTLE_DISTANCE = 0.08;

type Point = {
  x: number;
  y: number;
};

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!finePointer.matches || reducedMotion.matches) return;

    const mouse: Point = { x: -100, y: -100 };
    const points: Point[] = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }));
    let frameId = 0;
    let isAnimating = false;
    let isVisible = false;

    const setVisibility = (visible: boolean) => {
      isVisible = visible;
      if (cursorRef.current) cursorRef.current.style.opacity = visible ? '1' : '0';
      trailRefs.current.forEach((dot) => {
        if (dot) dot.style.opacity = visible ? dot.dataset.opacity ?? '0.3' : '0';
      });
    };

    const animateTrail = () => {
      let remainingMovement = 0;

      points.forEach((point, index) => {
        const target = index === 0 ? mouse : points[index - 1];
        const ease = Math.max(0.16, 0.34 - index * 0.018);
        const dx = target.x - point.x;
        const dy = target.y - point.y;

        point.x += dx * ease;
        point.y += dy * ease;
        remainingMovement += Math.abs(dx) + Math.abs(dy);

        const dot = trailRefs.current[index];
        if (dot) {
          dot.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`;
        }
      });

      if (remainingMovement > SETTLE_DISTANCE && isVisible) {
        frameId = window.requestAnimationFrame(animateTrail);
      } else {
        isAnimating = false;
        frameId = 0;
      }
    };

    const requestTrailFrame = () => {
      if (isAnimating) return;
      isAnimating = true;
      frameId = window.requestAnimationFrame(animateTrail);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      if (!isVisible) setVisibility(true);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }

      requestTrailFrame();
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = Boolean(target.closest('a, button, [data-cursor="interactive"]'));

      if (cursorRef.current) {
        cursorRef.current.style.width = interactive ? '12px' : '7px';
        cursorRef.current.style.height = interactive ? '12px' : '7px';
        cursorRef.current.style.backgroundColor = interactive ? '#adadad' : '#4d0d1c';
      }
    };

    const onMouseLeave = () => {
      setVisibility(false);
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      isAnimating = false;
    };

    const onMouseEnter = () => {
      setVisibility(true);
      requestTrailFrame();
    };

    const onVisibilityChange = () => {
      if (document.hidden && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
        isAnimating = false;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <>
      <style>{`
        .portfolio-cursor,
        .portfolio-cursor-trail {
          display: none;
          opacity: 0;
          pointer-events: none;
          will-change: transform;
        }

        @media (pointer: fine) and (prefers-reduced-motion: no-preference) {
          body, a, button, [data-cursor="interactive"] { cursor: none; }
          .portfolio-cursor,
          .portfolio-cursor-trail { display: block; }
        }
      `}</style>

      {Array.from({ length: TRAIL_LENGTH }).map((_, index) => {
        const size = Math.max(2.5, 6 - index * 0.45);
        const opacity = Math.max(0.08, 0.42 - index * 0.045);

        return (
          <div
            key={index}
            ref={(element) => { trailRefs.current[index] = element; }}
            aria-hidden="true"
            data-opacity={opacity.toString()}
            className="portfolio-cursor-trail fixed left-0 top-0 z-[9998] rounded-full bg-silver"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
            }}
          />
        );
      })}

      <div
        ref={cursorRef}
        aria-hidden="true"
        className="portfolio-cursor fixed left-0 top-0 z-[9999] h-[7px] w-[7px] rounded-full border border-white bg-primary shadow-[0_0_0_1px_rgba(77,13,28,0.18)] transition-[width,height,background-color] duration-150"
      />
    </>
  );
};

export default React.memo(CustomCursor);
