import { Component, DOCUMENT, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { currentUrl, pathOf } from '../shared/current-url';
import { Icon } from '../shared/icon';
import { LANGUAGE } from '../shared/language';
import { DOCS, LOCALES, Locale, RELEASES_URL, REPO_URL } from '../site';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

/** A language at the start of a path, which the switcher replaces rather than adds to. */
const LANGUAGE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`);

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  host: {
    // Not acrylic itself: a backdrop filter would hold the menu's sheet inside it.
    class: 'sticky top-0 z-50 block border-b border-stroke',
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
  templateUrl: './header.html',
})
export class Header {
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly repoUrl = REPO_URL;
  protected readonly docs = DOCS;
  protected readonly menuOpen = signal(false);

  protected readonly locale = inject(LANGUAGE);
  protected readonly other: Locale = this.locale === 'it' ? 'en' : 'it';
  protected readonly otherName = LANGUAGE_NAMES[this.other];
  protected readonly languages = LOCALES.map((code) => ({ code, name: LANGUAGE_NAMES[code] }));

  private readonly url = currentUrl();

  /**
   * The same page in each language: a separate build, so a full page load.
   *
   * The router's URL can start with a language already: on the root 404
   * page, whose base is /en/, or under ng serve, which serves one language
   * at /. Without dropping it, every switch would add another.
   */
  protected readonly hrefs = computed(() => {
    const path = pathOf(this.url()).replace(LANGUAGE_PREFIX, '');
    return Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}/`])) as Record<Locale, string>;
  });
  protected readonly otherHref = computed(() => this.hrefs()[this.other]);

  constructor() {
    // The page under the menu doesn't scroll while it's open.
    const root = inject(DOCUMENT).documentElement;
    effect(() => root.classList.toggle('overflow-hidden', this.menuOpen()));
  }
}
