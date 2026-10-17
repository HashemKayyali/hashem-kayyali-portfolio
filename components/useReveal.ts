import { useEffect, useRef } from 'react';

/**
 * Flips `data-revealed` on a container the first time it scrolls into view, so
 * CSS can play the section's entrance. One observer per section, disconnected
 * on first hit — no scroll listener, no rAF, no per-scroll React state.
 *
 * The start state lives behind `prefers-reduced-motion: no-preference`, so if
 * this never runs the content is simply visible.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      el.dataset.revealed = 'true';
    };

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
        observer.disconnect();
      },
      // Fires immediately for anything already on screen, and a little before
      // the rest arrives so the entrance is finishing as it lands.
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
