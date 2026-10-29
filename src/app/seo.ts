import { DOCUMENT, Service, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { pathOf } from './shared/current-url';
import { LANGUAGE } from './shared/language';
import { DOCS, LOCALES, Locale, OG_LOCALES, RELEASES_URL, REPO_URL, SITE_URL } from './site';

const DEFAULT_DESCRIPTION = $localize`:@@seo.description:WinDict is a free Windows app for looking up and translating words: select a word in any app, press Alt+D, and its definition opens right next to it.`;
const DOCS_HEADING = $localize`:@@docs.nav.heading:Documentation`;

/**
 * Keeps the head in step with the page: description, canonical link, the other languages' links,
 * Open Graph tags, and structured data. Pages with `noindex` in their data get none of the links.
 */
@Service()
export class Seo {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
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
    // The route's own title: the document's isn't set yet when the navigation ends.
    const title = leaf.title ?? 'WinDict';
    const description: string = leaf.data['description'] ?? DEFAULT_DESCRIPTION;
    const noindex = leaf.data['noindex'] === true;
    const canonical = `${SITE_URL}/${this.locale}${path}/`;

    this.meta.updateTag({ name: 'description', content: description });
    if (noindex) this.meta.updateTag({ name: 'robots', content: 'noindex' });
    else this.meta.removeTag('name="robots"');
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'WinDict' });
    this.meta.updateTag({
      property: 'og:locale',
      content: OG_LOCALES[this.locale as Locale] ?? OG_LOCALES.en,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: `${SITE_URL}/${this.locale}/og.jpg`,
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    const head = this.document.head;
    head
      .querySelectorAll(
        'link[rel="canonical"], link[rel="alternate"][hreflang], script[type="application/ld+json"]',
      )
      .forEach((l) => l.remove());
    if (noindex) return;

    this.link({ rel: 'canonical', href: canonical });
    for (const locale of LOCALES) {
      this.link({ rel: 'alternate', hreflang: locale, href: `${SITE_URL}/${locale}${path}/` });
    }
    this.link({ rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/en${path}/` });

    const data = this.structuredData(path, description);
    if (data) {
      const script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(data);
      head.appendChild(script);
    }
  }

  /** schema.org data: the app on the home page, the trail to each docs page. */
  private structuredData(path: string, description: string): object | undefined {
    const home = `${SITE_URL}/${this.locale}/`;
    if (path === '') {
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'WinDict',
            url: home,
            inLanguage: this.locale,
          },
          {
            '@type': 'SoftwareApplication',
            name: 'WinDict',
            description,
            url: home,
            image: `${SITE_URL}/${this.locale}/og.jpg`,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Windows 10, Windows 11',
            downloadUrl: RELEASES_URL,
            installUrl: RELEASES_URL,
            isAccessibleForFree: true,
            license: `${REPO_URL}/blob/main/LICENSE`,
            codeRepository: REPO_URL,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        ],
      };
    }

    const slug = path.match(/^\/docs\/([^/]+)$/)?.[1];
    const index = DOCS.findIndex((d) => d.slug === slug);
    if (index < 0) return undefined;
    const trail = [
      { name: 'WinDict', url: home },
      // The docs have no index page: their first page stands in for it.
      ...(index > 0 ? [{ name: DOCS_HEADING, url: `${home}docs/${DOCS[0].slug}/` }] : []),
      { name: DOCS[index].title, url: `${home}docs/${slug}/` },
    ];
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        item: t.url,
      })),
    };
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
