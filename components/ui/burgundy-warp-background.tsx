import React, { useEffect, useRef, useState } from 'react';
import { subscribeToSharedWarp } from './burgundy-warp-runtime';
import type { WarpRamp } from '../../types';

interface BurgundyWarpBackgroundProps {
  index?: number;
  className?: string;
  overlayOpacity?: number;
  speedMultiplier?: number;
  rootMargin?: string;
  /** Own palette for this surface. Omitted, it shares the burgundy field. */
  ramp?: WarpRamp;
  /** Above 1, tightens the pattern so more of it lands inside the surface. */
  density?: number;
}

type SurfaceSize = {
  width: number;
  height: number;
};

/* Motion of the copied field, and the margin that motion needs.

   The field drifts by DRIFT of the box in each direction and rotates a little,
   so it has to be drawn larger than the box or an edge slides into view and
   leaves a bare corner until the drift swings back. That was happening: drift
   reached 7.5% of the box while the old 1.12 base only extended the field 6%
   past each edge. It only showed on a surface whose palette differed from the
   fill underneath, which is why it surfaced with the yellow ramp and not on
   any burgundy one.

   COVER_BASE is derived from the motion rather than chosen, so changing the
   drift or the rotation cannot reintroduce the gap. */
const DRIFT = 0.075;
const ROTATION_AMPLITUDE = 0.055;
const ROTATION_BIAS = 0.012;
const PULSE_AMPLITUDE = 0.035;

/** Worst-case tilt: the oscillation plus the largest per-index offset. */
const MAX_ROTATION = ROTATION_AMPLITUDE + 2 * ROTATION_BIAS;

/** Drift needs DRIFT past both edges; the tilt needs cos+sin on top of that. */
const COVER_BASE =
  (1 + 2 * DRIFT) * (Math.cos(MAX_ROTATION) + Math.sin(MAX_ROTATION)) + PULSE_AMPLITUDE;

const drawSharedFrame = (
  target: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  animationTime: number,
  index: number,
  speedMultiplier: number,
  size: SurfaceSize,
) => {
  if (size.width < 1 || size.height < 1 || source.width < 1 || source.height < 1) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const width = Math.max(1, Math.round(size.width * dpr));
  const height = Math.max(1, Math.round(size.height * dpr));

  if (target.width !== width || target.height !== height) {
    target.width = width;
    target.height = height;
  }

  const phase = (Math.abs(index) + 1) * 1.61803398875;
  const localTime = animationTime * 0.00018 * Math.max(0.35, speedMultiplier);
  const rotation = Math.sin(localTime * 0.72 + phase) * ROTATION_AMPLITUDE + ((index % 5) - 2) * ROTATION_BIAS;
  const driftX = Math.sin(localTime + phase) * width * DRIFT;
  const driftY = Math.cos(localTime * 0.83 + phase * 0.71) * height * DRIFT;
  const pulse = COVER_BASE + Math.sin(localTime * 0.56 + phase) * PULSE_AMPLITUDE;
  const coverScale = Math.max(width / source.width, height / source.height) * pulse;

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#300510';
  context.fillRect(0, 0, width, height);
  context.translate(width / 2 + driftX, height / 2 + driftY);
  context.rotate(rotation);
  context.scale(coverScale, coverScale);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  context.setTransform(1, 0, 0, 1, 0, 0);
  target.style.opacity = '1';
};

const BurgundyWarpBackground: React.FC<BurgundyWarpBackgroundProps> = ({
  index = 0,
  className = '',
  overlayOpacity = 0.18,
  speedMultiplier = 1,
  rootMargin = '160px 0px',
  ramp,
  density = 1,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<SurfaceSize>({ width: 0, height: 0 });
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateSize = () => {
      const bounds = root.getBoundingClientRect();
      sizeRef.current = { width: bounds.width, height: bounds.height };
    };

    updateSize();

    const ResizeObserverConstructor = (window as Window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;

    if (!ResizeObserverConstructor) {
      window.addEventListener('resize', updateSize, { passive: true });
      return () => window.removeEventListener('resize', updateSize);
    }

    const observer = new ResizeObserverConstructor(updateSize);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin, threshold: 0 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isNearViewport) return;

    const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!context) return;

    let lastDrawTime = -Infinity;
    const unsubscribe = subscribeToSharedWarp((source, animationTime) => {
      if (animationTime - lastDrawTime < 1000 / 24) return;
      lastDrawTime = animationTime;

      drawSharedFrame(
        canvas,
        context,
        source,
        animationTime,
        index,
        speedMultiplier,
        sizeRef.current,
      );
    }, ramp ?? null, density);

    return () => {
      unsubscribe();
      canvas.style.opacity = '0';
      canvas.width = 1;
      canvas.height = 1;
    };
  }, [index, isNearViewport, speedMultiplier, ramp, density]);

  return (
    <div
      ref={rootRef}
      data-warp-surface={index}
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#300510] ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="burgundy-warp-canvas absolute inset-0 opacity-0 transition-opacity duration-300"
      />
      <div
        className="absolute inset-0"
        /* Ceiling raised from 0.5: a surface on its own bright ramp needs a
           heavier veil than the burgundy field ever did to keep its text
           legible. Still capped, so a stray value cannot black the surface out. */
        style={{ background: `rgba(8, 0, 3, ${Math.min(Math.max(overlayOpacity, 0), 0.7)})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.09), transparent 34%), linear-gradient(118deg, rgba(255,255,255,0.045), transparent 27%, transparent 74%, rgba(255,255,255,0.035))',
        }}
      />
    </div>
  );
};

export default React.memo(BurgundyWarpBackground);
