import { InjectionToken, LOCALE_ID, inject } from '@angular/core';

/** The language this build is in, as a two-letter code: en, it, es, fr, de or pt. */
export const LANGUAGE = new InjectionToken<string>('LANGUAGE', {
  factory: () => inject(LOCALE_ID).slice(0, 2),
});
