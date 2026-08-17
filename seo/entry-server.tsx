import { renderToString } from 'react-dom/server';
import App from '../App';
import type { Locale } from '../content/types';

/**
 * Build-time render of one locale's page.
 *
 * Only the render pass runs here — effects do not — which is what makes this
 * safe for a page whose visual system is browser-only. The WebGL surfaces, the
 * shared RAF loop, Lenis, the scroll-linked project stack and every
 * IntersectionObserver all start in effects, so on the server they contribute
 * their markup and none of their behaviour. Nothing needed a browser shim.
 *
 * The output is the same content the visitor sees, in the same DOM order, from
 * the same dictionaries. It is a static rendering of the page, not a separate
 * document written for crawlers.
 */
export const render = (locale: Locale): string => renderToString(<App initialLocale={locale} />);
