/** Where things are, and the docs' table of contents. */

export const SITE_URL = 'https://windict.bosio.zip';
export const REPO_URL = 'https://github.com/BosioPietro/WinDict';
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const WINGET_ID = 'BosioPietro.WinDict';

export const LOCALES = ['en', 'it', 'es', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

/** Each language the site is in, named in itself, as WinDict names them. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
};

/** Each language's Open Graph locale. */
export const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  it: 'it_IT',
  es: 'es_ES',
  fr: 'fr_FR',
};

export interface DocPage {
  slug: string;
  title: string;
}

/** In reading order: the sidebar, and Previous and Next under each page. */
export const DOCS: DocPage[] = [
  { slug: 'getting-started', title: $localize`:@@docs.nav.gettingStarted:Getting started` },
  { slug: 'looking-up-words', title: $localize`:@@docs.nav.lookingUp:Looking up words` },
  { slug: 'translating', title: $localize`:@@docs.nav.translating:Translating` },
  { slug: 'shortcuts', title: $localize`:@@docs.nav.shortcuts:Keyboard shortcuts` },
  { slug: 'command-line', title: $localize`:@@docs.nav.commandLine:On the command line` },
  { slug: 'above-start', title: $localize`:@@docs.nav.aboveStart:Above the Start menu` },
  { slug: 'settings', title: $localize`:@@docs.nav.settings:Settings` },
  { slug: 'dictionaries', title: $localize`:@@docs.nav.dictionaries:Dictionaries and network use` },
  { slug: 'building', title: $localize`:@@docs.nav.building:Building from source` },
];
