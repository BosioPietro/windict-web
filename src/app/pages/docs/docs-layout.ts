import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from '../../shared/icon';
import { DOCS, REPO_URL } from '../../site';

/** The docs: their table of contents on the side, the page, and links to the pages around it. */
@Component({
  selector: 'app-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './docs-layout.html',
})
export class DocsLayout {
  protected readonly docs = DOCS;
  protected readonly repoUrl = REPO_URL;

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  private readonly index = computed(() => {
    const slug = this.url().split(/[?#]/)[0].split('/').filter(Boolean).pop();
    return DOCS.findIndex((d) => d.slug === slug);
  });
  protected readonly current = computed(() => DOCS[this.index()]);
  protected readonly previous = computed(() =>
    this.index() > 0 ? DOCS[this.index() - 1] : undefined,
  );
  protected readonly next = computed(() => DOCS[this.index() + 1]);
}
