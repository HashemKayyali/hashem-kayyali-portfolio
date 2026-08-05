import React, { useEffect, useRef, useState } from 'react';
import { subscribeToSharedWarp } from './burgundy-warp-runtime';

interface BurgundyWarpBackgroundProps {
  index?: number;
  className?: string;
  overlayOpacity?: number;
  speedMultiplier?: number;
  rootMargin?: string;
}

type SurfaceSize = {
  width: number;
  height: number;
};

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
  const rotation = Math.sin(localTime * 0.72 + phase) * 0.055 + ((index % 5) - 2) * 0.012;
  const driftX = Math.sin(localTime + phase) * width * 0.075;
  const driftY = Math.cos(localTime * 0.83 + phase * 0.71) * height * 0.075;
  const pulse = 1.12 + Math.sin(localTime * 0.56 + phase) * 0.035;
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
    });

    return () => {
      unsubscribe();
      canvas.style.opacity = '0';
      canvas.width = 1;
      canvas.height = 1;
    };
  }, [index, isNearViewport, speedMultiplier]);

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
        style={{ background: `rgba(8, 0, 3, ${Math.min(Math.max(overlayOpacity, 0), 0.5)})` }}
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
