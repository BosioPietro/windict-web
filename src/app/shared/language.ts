import { InjectionToken, LOCALE_ID, inject } from '@angular/core';

/** The language this build is in, as a two-letter code: en, or it. */
export const LANGUAGE = new InjectionToken<string>('LANGUAGE', {
  factory: () => inject(LOCALE_ID).slice(0, 2),
});
