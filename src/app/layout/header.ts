import { ChangeDetectionStrategy, Component, LOCALE_ID, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from '../shared/icon';
import { RELEASES_URL, REPO_URL } from '../site';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  host: { class: 'acrylic sticky top-0 z-50 block border-b border-stroke' },
  templateUrl: './header.html',
})
export class Header {
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly repoUrl = REPO_URL;
  protected readonly menuOpen = signal(false);

  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID).slice(0, 2);
  protected readonly other = this.locale === 'it' ? 'en' : 'it';
  protected readonly otherName = this.locale === 'it' ? 'English' : 'Italiano';

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** The same page in the other language: a separate build, so a full page load. */
  protected otherHref(): string {
    const path = this.url().split(/[?#]/)[0].replace(/\/$/, '');
    return `/${this.other}${path}/`;
  }
}
