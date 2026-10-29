import { Component, computed, input } from '@angular/core';

/** The screenshots in public/images, each in light and dark, and their height at 1600px wide. */
const HEIGHTS = {
  lookup: 1024,
  'lookup-full': 1421,
  'lookup-card': 1200,
  translate: 1200,
  start: 1102,
  tray: 972,
  welcome: 1200,
  dictionaries: 1200,
} as const;

export type ShotName = keyof typeof HEIGHTS;

/** A screenshot of WinDict on the Windows desktop, in the visitor's theme. */
@Component({
  selector: 'app-shot',
  host: { class: 'block' },
  template: `
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        [attr.srcset]="darkSrcset()"
        [attr.sizes]="sizes()"
        type="image/webp"
      />
      <img
        class="block h-auto w-full"
        [attr.src]="src()"
        [attr.srcset]="lightSrcset()"
        [attr.sizes]="sizes()"
        [attr.alt]="alt()"
        width="1600"
        [attr.height]="height()"
        [attr.loading]="eager() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="eager() ? 'high' : null"
        decoding="async"
      />
    </picture>
  `,
})
export class Shot {
  readonly name = input.required<ShotName>();
  readonly alt = input.required<string>();
  readonly eager = input(false);
  readonly sizes = input('(min-width: 1024px) 50vw, 100vw');

  protected readonly height = computed(() => HEIGHTS[this.name()]);
  protected readonly src = computed(() => `images/${this.name()}-light-1600.webp`);
  protected readonly lightSrcset = computed(() => srcset(this.name(), 'light'));
  protected readonly darkSrcset = computed(() => srcset(this.name(), 'dark'));
}

function srcset(name: ShotName, theme: 'light' | 'dark'): string {
  const base = `images/${name}-${theme}`;
  return `${base}-960.webp 960w, ${base}-1600.webp 1600w`;
}
