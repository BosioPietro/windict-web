import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-xl px-4 py-32 text-center">
      <p class="font-display text-7xl font-semibold text-accent">404</p>
      <h1 class="mt-4 font-display text-3xl font-semibold" i18n="@@notFound.title">
        No definition found
      </h1>
      <p class="mt-3 text-muted" i18n="@@notFound.text">
        This page isn't in the dictionary. Check the spelling?
      </p>
      <div class="mt-8 flex justify-center gap-3">
        <a routerLink="/" class="btn-accent" i18n="@@notFound.home">Go to the home page</a>
        <a routerLink="/docs" class="btn-standard" i18n="@@notFound.docs">Read the docs</a>
      </div>
    </section>
  `,
})
export class NotFound {}
