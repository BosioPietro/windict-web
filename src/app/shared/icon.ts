import { Component, computed, input } from '@angular/core';
import { ICONS, IconName } from './icons';

/** A Fluent System Icon, drawn in the text's color. Size it with classes. */
@Component({
  selector: 'app-icon',
  host: { class: 'inline-block shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="block size-full">
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly paths = computed(() => ICONS[this.name()]);
}
