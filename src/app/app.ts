import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { Seo } from './seo';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <button
      type="button"
      class="sr-only z-[60] rounded-ctl bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      (click)="main.focus()"
      i18n="@@skip"
    >
      Skip to content
    </button>
    <app-header />
    <main #main id="main" tabindex="-1" class="flex-1 outline-none">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class App {
  constructor() {
    inject(Seo);
  }
}
