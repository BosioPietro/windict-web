import { DOCUMENT, Service, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { pathOf } from './shared/current-url';
import { LANGUAGE } from './shared/language';
import { LOCALES, SITE_URL } from './site';

const DEFAULT_DESCRIPTION = $localize`:@@seo.description:WinDict is a free Windows app for looking up and translating words: select a word in any app, press Alt+D, and its definition opens right next to it.`;

/** Keeps the head in step with the page: description, canonical link, the other language's link, and Open Graph tags. */
@Service()
export class Seo {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly locale = inject(LANGUAGE);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.update(e.urlAfterRedirects, leafOf(this.router)));
  }

  private update(url: string, leaf: ActivatedRouteSnapshot) {
    const path = pathOf(url);
    const description: string = leaf.data['description'] ?? DEFAULT_DESCRIPTION;
    const canonical = `${SITE_URL}/${this.locale}${path}/`;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: this.title.getTitle() });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'WinDict' });
    this.meta.updateTag({
      property: 'og:locale',
      content: this.locale === 'it' ? 'it_IT' : 'en_US',
    });
    this.meta.updateTag({
      property: 'og:image',
      content: `${SITE_URL}/${this.locale}/og.jpg`,
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    const head = this.document.head;
    head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach((l) => l.remove());
    this.link({ rel: 'canonical', href: canonical });
    for (const locale of LOCALES) {
      this.link({ rel: 'alternate', hreflang: locale, href: `${SITE_URL}/${locale}${path}/` });
    }
    this.link({ rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/en${path}/` });
  }

  private link(attrs: Record<string, string>) {
    const link = this.document.createElement('link');
    for (const [k, v] of Object.entries(attrs)) link.setAttribute(k, v);
    this.document.head.appendChild(link);
  }
}

/** The deepest route of the one shown, whose data describes the page. */
function leafOf(router: Router): ActivatedRouteSnapshot {
  let route = router.routerState.snapshot.root;
  while (route.firstChild) route = route.firstChild;
  return route;
}
