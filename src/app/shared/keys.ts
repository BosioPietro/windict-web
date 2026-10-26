import { Component, computed, input } from '@angular/core';

/** A shortcut as keycaps: "Ctrl+T" is Ctrl, then T. A "/" separates alternatives. */
@Component({
  selector: 'app-keys',
  host: { class: 'inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 align-baseline' },
  template: `
    @for (combo of combos(); track $index; let last = $last) {
      <span class="inline-flex items-center gap-1 whitespace-nowrap">
        @for (key of combo; track $index; let lastKey = $last) {
          <kbd class="kbd">{{ key }}</kbd>
          @if (!lastKey) {
            <span class="text-[0.85em] text-subtle">+</span>
          }
        }
        @if (!last) {
          <span class="ml-0.5 text-[0.85em] text-subtle">/</span>
        }
      </span>
    }
  `,
})
export class Keys {
  readonly keys = input.required<string>();
  protected readonly combos = computed(() =>
    this.keys()
      .split(' / ')
      .map((combo) => combo.split(/\+(?!$)/)),
  );
}
