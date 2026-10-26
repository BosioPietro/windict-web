/** Where things are, and the docs' table of contents. */

export const SITE_URL = 'https://windict.bosio.zip';
export const REPO_URL = 'https://github.com/BosioPietro/WinDict';
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const WINGET_ID = 'BosioPietro.WinDict';

export const LOCALES = ['en', 'it'] as const;
export type Locale = (typeof LOCALES)[number];

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
