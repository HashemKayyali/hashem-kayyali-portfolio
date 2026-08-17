/**
 * Builds the per-locale document head.
 *
 * Every absolute URL here derives from SITE_URL, and every string derives from
 * the locale dictionaries, so the head cannot drift from the page it describes.
 */

import { LOCALES } from '../content/types.ts';
import { canonicalUrl, LOCALE_META, SITE_URL } from '../i18n/config.ts';

export { LOCALES, SITE_URL, canonicalUrl };

export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const escapeAttribute = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Person, WebSite and ProfilePage, from facts already in the repository.
 *
 * Nothing is asserted that the portfolio does not already state publicly: no
 * institution for the in-progress degree, no awards, no ratings, no profiles
 * beyond the two the site itself links to.
 */
const structuredData = (locale, dictionary, profile) => {
  const personId = `${SITE_URL}/#person`;
  const siteId = `${SITE_URL}/#website`;

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Hashem Kayyali',
    alternateName: 'هاشم كيالي',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/images/hashem-profile.webp`,
    jobTitle: ['Co-Founder & R&D Product Engineer', 'Software Engineer'],
    description: dictionary.seo.description,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Amman',
      addressCountry: 'JO',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Eventies',
      url: 'https://www.eventiesjo.com/',
    },
    sameAs: [profile.social.linkedin, profile.social.instagram],
    knowsAbout: [
      'Software Engineering',
      'Product Engineering',
      'Web Development',
      'Mobile Development',
      'Desktop Software',
      'Internet of Things',
      'Embedded Systems',
      'Connected Systems',
      'Computer Vision',
      'Automation',
      'PCB Design',
    ],
  };

  const website = {
    '@type': 'WebSite',
    '@id': siteId,
    url: `${SITE_URL}/`,
    // The preferred site name in a search result is the person, not a generic
    // word like "Portfolio".
    name: 'Hashem Kayyali',
    alternateName: 'هاشم كيالي',
    inLanguage: LOCALE_META[locale].htmlLang,
    publisher: { '@id': personId },
  };

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': `${canonicalUrl(locale)}#profilepage`,
    url: canonicalUrl(locale),
    name: dictionary.seo.title,
    description: dictionary.seo.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    isPartOf: { '@id': siteId },
    about: { '@id': personId },
    primaryImageOfPage: `${SITE_URL}/images/hashem-profile.webp`,
  };

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [person, website, profilePage],
  });
};

/** The full `<head>` inner HTML for one locale. */
export const buildHead = (locale, dictionary, profile) => {
  const meta = LOCALE_META[locale];
  const canonical = canonicalUrl(locale);
  const title = escapeAttribute(dictionary.seo.title);
  const description = escapeAttribute(dictionary.seo.description);

  /* Reciprocal alternates: every locale lists all five plus x-default, and
     x-default points at the root, which is the English page. */
  const alternates = LOCALES.map(
    (other) =>
      `    <link rel="alternate" hreflang="${LOCALE_META[other].htmlLang}" href="${canonicalUrl(other)}" />`,
  )
    .concat(`    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`)
    .join('\n');

  const alternateOgLocales = LOCALES.filter((other) => other !== locale)
    .map((other) => `    <meta property="og:locale:alternate" content="${LOCALE_META[other].ogLocale}" />`)
    .join('\n');

  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="theme-color" content="#4d0d1c" />
    <meta name="author" content="Hashem Kayyali" />

${alternates}

    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Hashem Kayyali" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
    <meta property="og:image:alt" content="${escapeAttribute(dictionary.ui.alt.profile)}" />
    <meta property="og:locale" content="${meta.ogLocale}" />
${alternateOgLocales}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${escapeAttribute(dictionary.ui.alt.profile)}" />

    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <script type="application/ld+json">${structuredData(locale, dictionary, profile)}</script>`;
};
