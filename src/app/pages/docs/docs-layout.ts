import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { currentUrl, pathOf } from '../../shared/current-url';
import { Icon } from '../../shared/icon';
import { DOCS, DocPage, REPO_URL } from '../../site';

/** The docs: their table of contents on the side, the page, and links to the pages around it. */
@Component({
  selector: 'app-docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './docs-layout.html',
})
export class DocsLayout {
  protected readonly docs = DOCS;
  protected readonly repoUrl = REPO_URL;

  private readonly url = currentUrl();

  private readonly index = computed(() => {
    const slug = pathOf(this.url()).split('/').filter(Boolean).pop();
    return DOCS.findIndex((d) => d.slug === slug);
  });
  protected readonly current = computed((): DocPage | undefined => DOCS[this.index()]);
  protected readonly previous = computed(() =>
    this.index() > 0 ? DOCS[this.index() - 1] : undefined,
  );
  protected readonly next = computed((): DocPage | undefined => DOCS[this.index() + 1]);
}
