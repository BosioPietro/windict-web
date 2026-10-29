import {
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { currentUrl, pathOf } from '../shared/current-url';
import { Icon } from '../shared/icon';
import { LANGUAGE } from '../shared/language';
import { DOCS, LANGUAGE_NAMES, LOCALES, Locale, RELEASES_URL, REPO_URL } from '../site';

/** A language at the start of a path, which the switcher replaces rather than adds to. */
const LANGUAGE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`);

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  host: {
    // Not acrylic itself: a backdrop filter would hold the menu's sheet inside it.
    class: 'sticky top-0 z-50 block border-b border-stroke',
    '(document:keydown.escape)': 'closeAll()',
    '(document:click)': 'clickedAway($event)',
  },
  templateUrl: './header.html',
})
export class Header {
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly repoUrl = REPO_URL;
  protected readonly docs = DOCS;
  protected readonly menuOpen = signal(false);
  /** The flyout of languages, on wider screens. */
  protected readonly languagesOpen = signal(false);

  protected readonly locale = inject(LANGUAGE) as Locale;
  protected readonly localeName = LANGUAGE_NAMES[this.locale];
  protected readonly languages = LOCALES.map((code) => ({ code, name: LANGUAGE_NAMES[code] }));

  private readonly picker = viewChild<ElementRef<HTMLElement>>('picker');
  private readonly pickerButton = viewChild<ElementRef<HTMLElement>>('pickerButton');

  private readonly url = currentUrl();

  /**
   * The same page in each language: a separate build, so a full page load.
   *
   * The router's URL can start with a language already: on the root 404
   * page, whose base is /en/, or under ng serve, which serves one language
   * at /. Without dropping it, every switch would add another.
   */
  protected readonly hrefs = computed(() => {
    const path = pathOf(this.url()).replace(LANGUAGE_PREFIX, '');
    return Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}/`])) as Record<Locale, string>;
  });

  constructor() {
    // The page under the menu doesn't scroll while it's open.
    const root = inject(DOCUMENT).documentElement;
    effect(() => root.classList.toggle('overflow-hidden', this.menuOpen()));
  }

  protected closeAll() {
    // Escape from the flyout gives focus back to its button, as Fluent's menus do.
    if (this.languagesOpen()) this.pickerButton()?.nativeElement.focus();
    this.menuOpen.set(false);
    this.languagesOpen.set(false);
  }

  /** A click anywhere but on the flyout or its button closes it. */
  protected clickedAway(event: MouseEvent) {
    const picker = this.picker()?.nativeElement;
    if (picker && !picker.contains(event.target as Node)) this.languagesOpen.set(false);
  }

  /** Focus leaving the flyout and its button, as on tabbing past the last language, closes it. */
  protected focusedAway(event: FocusEvent) {
    const picker = this.picker()?.nativeElement;
    if (picker && !picker.contains(event.relatedTarget as Node | null))
      this.languagesOpen.set(false);
  }
}
