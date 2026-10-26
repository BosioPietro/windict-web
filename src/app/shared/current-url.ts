import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/** The router's URL, after each navigation ends. Call it where inject() works. */
export function currentUrl(): Signal<string> {
  const router = inject(Router);
  return toSignal(
    router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: router.url },
  );
}

/** A URL's path, without its query, fragment, or trailing slash. */
export function pathOf(url: string): string {
  return url.split(/[?#]/)[0].replace(/\/$/, '');
}
