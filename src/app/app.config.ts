import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withI18nSupport,
} from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  UrlSerializer,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { TrailingSlashSerializer } from './shared/trailing-slash';

/** The route a snapshot of the whole tree ends in: the page. */
function pageOf(root: ActivatedRouteSnapshot) {
  let route = root;
  while (route.firstChild) route = route.firstChild;
  return route.routeConfig;
}

/** Whether a snapshot of the whole tree is in the docs. */
function inDocs(root: ActivatedRouteSnapshot) {
  return root.firstChild?.routeConfig?.path === 'docs';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      // Only from one docs page to another (styles.css): elsewhere, and to
      // a heading on the same page, it's as it was.
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (!inDocs(from) || !inDocs(to) || pageOf(from) === pageOf(to)) {
            transition.skipTransition();
          }
        },
      }),
    ),
    // Without i18n support, every component with translated text skips
    // hydration and is rendered again from scratch, which moves the page.
    provideClientHydration(withEventReplay(), withI18nSupport()),
    { provide: UrlSerializer, useClass: TrailingSlashSerializer },
  ],
};
