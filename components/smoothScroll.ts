import Lenis from 'lenis';

/**
 * Smooth scrolling for the page.
 *
 * Lenis rather than a transform-based smooth-scroll library on purpose: it
 * drives the real scroll position instead of translating a wrapper, which is
 * what keeps this page working — the project stack is built on `position:
 * sticky`, every section reveal is an IntersectionObserver, and the card
 * recession reads `scrollY` through framer-motion. A wrapper-transform library
 * would break all three at once.
 *
 * Nested scrollers opt out with `data-lenis-prevent`, which Lenis honours
 * natively, so the project modal keeps its own native scrolling.
 */
let lenis: Lenis | null = null;
let paused = false;

/**
 * Starts smoothing, unless the reader has asked for reduced motion — in which
 * case nothing is instantiated at all and the browser's own scrolling is left
 * alone. The preference is watched, so toggling it in the OS takes effect
 * without a reload.
 */
export function startSmoothScroll(): () => void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(pointer: fine)');

  const start = () => {
    if (lenis || query.matches || !pointer.matches || document.visibilityState !== 'visible') return;
    lenis = new Lenis({
      // Lenis drives its own rAF loop; nothing here needs to own one.
      autoRaf: true,
      // Long settle, near-expo — the same shape as the site's --motion-ease,
      // so scrolling feels like the rest of the motion rather than a plugin.
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      // Touch keeps the platform's own momentum. Syncing it replaces a scroll
      // the finger is physically driving with an interpolated one, which is
      // what makes smooth-scroll libraries feel laggy on phones.
      syncTouch: false,
      // In-page links (footer index, back to top) run through Lenis instead of
      // the browser, so they land with the same easing as a wheel scroll.
      anchors: true,
    });
    if (paused) lenis.stop();
  };

  const stop = () => {
    lenis?.destroy();
    lenis = null;
  };

  const sync = () => (query.matches || !pointer.matches || document.visibilityState !== 'visible' ? stop() : start());

  sync();
  query.addEventListener('change', sync);
  pointer.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);

  return () => {
    query.removeEventListener('change', sync);
    pointer.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    stop();
  };
}

/**
 * Scrolls through Lenis when it is running, and natively when it is not, so
 * callers never have to know which is the case.
 */
export function scrollToTarget(
  target: HTMLElement | number,
  options: { immediate?: boolean; offset?: number } = {},
) {
  if (lenis) {
    lenis.scrollTo(target, options);
    return;
  }

  const top =
    (typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY) +
    (options.offset ?? 0);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: options.immediate || reducedMotion ? 'instant' : 'smooth' });
}

/** Held while a modal owns the screen, so the page underneath cannot drift. */
export function pauseSmoothScroll() {
  paused = true;
  lenis?.stop();
}

export function resumeSmoothScroll() {
  paused = false;
  lenis?.start();
}
