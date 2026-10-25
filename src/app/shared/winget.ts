import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { WINGET_ID } from '../site';
import { Icon } from './icon';

/** The command that installs WinDict with WinGet, and a button that copies it. */
@Component({
  selector: 'app-winget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <div
      class="flex items-center gap-2 rounded-card border border-stroke bg-surface py-1.5 pr-1.5 pl-3.5 font-mono text-[13.5px] shadow-card"
    >
      <span class="text-subtle select-none" aria-hidden="true">&gt;</span>
      <code class="min-w-0 flex-1 truncate">{{ command }}</code>
      <button
        type="button"
        class="flex h-8 shrink-0 items-center gap-1.5 rounded-ctl px-2.5 font-sans text-[13px] text-muted transition-colors hover:bg-surface-hover hover:text-fg"
        (click)="copy()"
      >
        <app-icon [name]="copied() ? 'checkmark' : 'copy'" class="size-4" />
        @if (copied()) {
          <span i18n="@@winget.copied">Copied</span>
        } @else {
          <span i18n="@@winget.copy">Copy</span>
        }
      </button>
    </div>
  `,
})
export class Winget {
  protected readonly command = `winget install ${WINGET_ID}`;
  protected readonly copied = signal(false);

  protected async copy() {
    try {
      await navigator.clipboard.writeText(this.command);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Without clipboard access, the command can still be selected by hand.
    }
  }
}
