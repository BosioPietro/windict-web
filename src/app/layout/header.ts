import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  LOCALE_ID,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from '../shared/icon';
import { DOCS, RELEASES_URL, REPO_URL } from '../site';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private readonly router = inject(Router);
  protected readonly locale = inject(LOCALE_ID).slice(0, 2);
  protected readonly other = this.locale === 'it' ? 'en' : 'it';
  protected readonly otherName = this.locale === 'it' ? 'English' : 'Italiano';
  protected readonly languages = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    // The page under the menu doesn't scroll while it's open.
    const root = inject(DOCUMENT).documentElement;
    effect(() => root.classList.toggle('overflow-hidden', this.menuOpen()));
  }

  /** The same page in another language: a separate build, so a full page load. */
  protected hrefIn(locale: string): string {
    // The router's URL can start with a language already: on the root 404
    // page, whose base is /en/, or under ng serve, which serves one language
    // at /. Without dropping it, every switch would add another.
    const path = this.url()
      .split(/[?#]/)[0]
      .replace(/\/$/, '')
      .replace(new RegExp(`^/(${this.languages.map((l) => l.code).join('|')})(?=/|$)`), '');
    return `/${locale}${path}/`;
  }

  protected otherHref(): string {
    return this.hrefIn(this.other);
  }
}
