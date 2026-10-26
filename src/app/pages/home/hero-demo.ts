import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../../shared/icon';
import { Keys } from '../../shared/keys';
import { LANGUAGE } from '../../shared/language';

type Mode = 'define' | 'translate';

interface Sense {
  text: string;
  example?: string;
}

interface Term {
  text: string;
  back: string;
}

/** What the card shows on one language's page, as WinDict would show it. */
interface Demo {
  label: string;
  /** The browser tab's title, and the site it's on. */
  page: string;
  site: string;
  /** The passage, split around the word looked up and the foreign one translated. */
  before: string;
  word: string;
  between: string;
  foreign: string;
  after: string;
  /** The paragraph after it. */
  next: string;
  heading: string;
  pos: string;
  senses: Sense[];
  similarLabel: string;
  similar: string[];
  source: string;
  from: { name: string; flag: 'gb' | 'it' };
  to: { name: string; flag: 'gb' | 'it' };
  translation: string;
  /** The foreign word's part of speech, named in WinDict's language. */
  foreignPos: string;
  terms: Term[];
  tips: { speak: string; translate: string; pin: string; swap: string };
}

/**
 * The definitions are the very ones WinDict's dictionaries have: Open English
 * WordNet's for "serene", Wikizionario's for "brezza". The translations are
 * what Google Translate gives for "passeggiata" and "cosy".
 */
const DEMOS: Record<string, Demo> = {
  en: {
    label: 'WinDict defining “serene” and translating “passeggiata”, both selected in a travel article',
    page: 'Slow evenings on the Ligurian coast',
    site: 'postcards.example/liguria',
    before: 'At this hour the bay lies flat and ',
    word: 'serene',
    between: ', and the ',
    foreign: 'passeggiata',
    after:
      ' has begun: whole families walk the seafront arm in arm, stopping for a gelato or a word with the neighbours.',
    next: 'Find a table at one of the bars by the harbour, order a spritz and watch the town go by. Nobody will hurry you, and dinner here rarely starts before nine.',
    heading: 'Serene',
    pos: 'Adjective',
    senses: [
      { text: 'Not agitated; without losing self-possession.', example: 'Spoke in a calm voice' },
      { text: 'Completely clear and fine.', example: 'Serene skies and a bright blue sea' },
    ],
    similarLabel: 'Similar',
    similar: ['calm', 'unagitated', 'tranquil'],
    source: 'Open English WordNet',
    from: { name: 'Italiano', flag: 'it' },
    to: { name: 'English', flag: 'gb' },
    translation: 'Stroll',
    foreignPos: 'Noun',
    terms: [
      { text: 'Walk', back: 'Passeggiata, camminata, passo' },
      { text: 'Stroll', back: 'Passeggiata, passeggio, giro' },
      { text: 'Ride', back: 'Giro, corsa, cavalcata' },
    ],
    tips: {
      speak: 'Listen',
      translate: 'Translate (Ctrl+T)',
      pin: 'Pin window',
      swap: 'Swap languages',
    },
  },
  it: {
    label: 'WinDict che definisce “brezza” e traduce “cosy”, selezionate in un articolo di viaggi',
    page: 'Edimburgo d’inverno, senza fretta',
    site: 'cartoline.example/edimburgo',
    before: 'Quando una ',
    word: 'brezza',
    between: ' gelida sale dal mare, i pub della città vecchia diventano ',
    foreign: 'cosy',
    after: ' come il salotto di casa: legno scuro, il camino acceso e una pinta che nessuno ha fretta di finire.',
    next: 'Di giorno, invece, vale la pena salire fino al castello e scendere a piedi lungo il Royal Mile, fermandosi nelle botteghe e nei vicoli che si aprono ai lati.',
    heading: 'Brezza',
    pos: 'Sostantivo',
    senses: [
      { text: 'Moto dell’aria a velocità ridotta, vento di bassa intensità.' },
      {
        text: 'Piacevole venticello.',
        example: 'Cercava di godersi la prima brezza dell’estate, invero senza riuscirci',
      },
    ],
    similarLabel: 'Sinonimi',
    similar: ['venticello', 'arietta', 'zefiro'],
    source: 'Wikizionario',
    from: { name: 'English', flag: 'gb' },
    to: { name: 'Italiano', flag: 'it' },
    translation: 'Accogliente',
    foreignPos: 'Aggettivo',
    terms: [
      { text: 'Accogliente', back: 'Cozy, hospitable, snug' },
      { text: 'Confortevole', back: 'Comfortable, cozy, comforting' },
      { text: 'Intimo', back: 'Intimate, cozy, inner' },
    ],
    tips: {
      speak: 'Ascolta',
      translate: 'Traduci (Ctrl+T)',
      pin: 'Fissa finestra',
      swap: 'Inverti le lingue',
    },
  },
};

/** The word looked up is the first in the passage; the foreign one, the second. */
const WORDS: Record<Mode, 0 | 1> = { define: 0, translate: 1 };

/** How long the visitor has to take in the page before anything moves. */
const START_MS = 1700;
/** How long a card stays open before it's clicked away. */
const HOLD_MS = 5500;
/** How long the drag takes over each letter of the foreign word. */
const LETTER_MS = 70;
const EASE = 'cubic-bezier(0.45, 0, 0.2, 1)';

interface Point {
  x: number;
  y: number;
}

/**
 * WinDict's card, built in HTML, as someone reading an article would use it:
 * they double-click a word and press Alt+D, read its definition and press
 * Esc; then drag across a foreign word, press Alt+T, read its translation
 * and press Esc; and again.
 */
@Component({
  selector: 'app-hero-demo',
  imports: [NgTemplateOutlet, Icon, Keys],
  templateUrl: './hero-demo.html',
  styleUrl: './hero-demo.css',
})
export class HeroDemo {
  protected readonly demo = DEMOS[inject(LANGUAGE)] ?? DEMOS['en'];
  /** Each word a letter at a time, so a drag can select it as it goes. */
  protected readonly letters = [[...this.demo.word], [...this.demo.foreign]];
  protected readonly mode = signal<Mode>('define');
  /** How many letters of which word are selected, and how wide they are. */
  private readonly selection = signal<{ word: 0 | 1; count: number; width: number } | null>(null);
  protected readonly selected = computed(() => {
    const s = this.selection();
    return [0, 1].map((word) => (s?.word === word ? s : { count: 0, width: 0 }));
  });
  protected readonly open = signal(false);
  /** Where the card is, under the word; until measured, about there. */
  protected readonly place = signal<{ left: number; top: number } | null>(null);
  /** The pointer: where it is, and how it gets there. */
  protected readonly pointer = signal({ x: 0, y: 0, ms: 0, ease: EASE, shown: false });
  /** The last click, numbered so its ring plays again. */
  protected readonly clicks = signal<(Point & { n: number })[]>([]);
  /** The keys just pressed, shown for a moment. */
  protected readonly pressed = signal({ keys: 'Alt+D', shown: false });

  private readonly scene = viewChild.required<ElementRef<HTMLElement>>('scene');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly word = viewChild.required<ElementRef<HTMLElement>>('word');
  private readonly foreign = viewChild.required<ElementRef<HTMLElement>>('foreign');

  /** Bumped to stop the loop: a step that wakes to a newer run gives up. */
  private run = 0;
  private paused = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.placeCard());
      observer.observe(this.scene().nativeElement);
      destroyRef.onDestroy(() => {
        this.run++;
        observer.disconnect();
      });
      // Plays by itself, unless the visitor would rather nothing moved: then
      // the definition just stays open.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.select(0, this.letters[0].length);
        this.placeCard();
        this.open.set(true);
      } else this.loop(this.run);
    });
  }

  protected pause(paused: boolean) {
    this.paused = paused;
  }

  private async loop(run: number) {
    const live = () => run === this.run;
    // The pointer comes from the bottom of the page.
    const scene = this.scene().nativeElement;
    this.pointer.set({ x: scene.clientWidth * 0.55, y: scene.clientHeight - 30, ms: 0, ease: EASE, shown: false });
    if (!(await this.sleep(START_MS, live))) return;
    this.pointer.update((p) => ({ ...p, shown: true }));
    while (
      (await this.lookUp(live)) &&
      (await this.sleep(700, live)) &&
      (await this.translate(live)) &&
      (await this.sleep(900, live))
    );
  }

  /** Double-clicks the word, presses Alt+D, reads, presses Esc. */
  private async lookUp(live: () => boolean) {
    this.mode.set('define');
    const word = this.rect(0);
    const middle = { x: word.left + word.width * 0.55, y: word.top + word.height / 2 };
    if (!((await this.move(middle, 950, live)) && (await this.sleep(220, live)))) return false;
    this.click();
    if (!(await this.sleep(110, live))) return false;
    this.click();
    this.select(0, this.letters[0].length);
    return this.press('Alt+D', live);
  }

  /** Drags across the foreign word, presses Alt+T, reads, presses Esc. */
  private async translate(live: () => boolean) {
    this.mode.set('translate');
    const word = this.rect(1);
    const y = word.top + word.height / 2;
    if (!((await this.move({ x: word.left + 1, y }, 900, live)) && (await this.sleep(200, live)))) return false;
    // A letter is selected once the pointer is past its middle, as in any text.
    const scene = this.scene().nativeElement.getBoundingClientRect();
    const ms = this.letters[1].length * LETTER_MS;
    const passed = [...this.foreign().nativeElement.querySelectorAll('.letter')].map((letter) => {
      const r = letter.getBoundingClientRect();
      return ((r.left + r.width / 2 - scene.left - word.left) / word.width) * ms;
    });
    this.select(1, 0);
    this.pointer.update((p) => ({ ...p, x: word.right, ms, ease: 'linear' }));
    const start = performance.now();
    for (const [i, at] of passed.entries()) {
      if (!(await this.sleep(at - (performance.now() - start), live))) return false;
      this.select(1, i + 1);
    }
    return (await this.sleep(ms - (performance.now() - start) + 150, live)) && this.press('Alt+T', live);
  }

  /** Presses the keys, opens the card, leaves it a while, then presses Esc. */
  private async press(keys: string, live: () => boolean) {
    if (!(await this.sleep(400, live))) return false;
    this.pressed.set({ keys, shown: true });
    if (!(await this.sleep(280, live))) return false;
    this.placeCard();
    this.open.set(true);
    if (!(await this.sleep(1200, live))) return false;
    this.pressed.update((p) => ({ ...p, shown: false }));
    if (!(await this.hold(HOLD_MS, live))) return false;
    // The card goes; the word stays selected, as in any app.
    this.pressed.set({ keys: 'Esc', shown: true });
    if (!(await this.sleep(250, live))) return false;
    this.open.set(false);
    if (!(await this.sleep(900, live))) return false;
    this.pressed.update((p) => ({ ...p, shown: false }));
    return true;
  }

  private move(to: Point, ms: number, live: () => boolean) {
    this.pointer.update((p) => ({ ...p, ...to, ms, ease: EASE }));
    return this.sleep(ms, live);
  }

  private click() {
    const { x, y } = this.pointer();
    this.clicks.update((c) => [{ x, y, n: (c[0]?.n ?? 0) + 1 }]);
  }

  /** Waits `ms`, then says whether the loop goes on. */
  private sleep(ms: number, live: () => boolean) {
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(live()), Math.max(0, ms)));
  }

  /** Waits `ms`, not counting the time the visitor has the pointer on the scene. */
  private async hold(ms: number, live: () => boolean) {
    for (let left = ms; left > 0; left -= this.paused ? 0 : 100) {
      if (!(await this.sleep(100, live))) return false;
    }
    return true;
  }

  /**
   * Selects the word's first `count` letters. The selection is drawn under
   * the whole word at once, not letter by letter, or each letter's would
   * cover the tail of the one before.
   */
  private select(word: 0 | 1, count: number) {
    const letters = (word === 0 ? this.word() : this.foreign()).nativeElement.querySelectorAll('.letter');
    const width = count ? letters[count - 1].getBoundingClientRect().right - letters[0].getBoundingClientRect().left : 0;
    this.selection.set({ word, count, width });
  }

  /** A word's box, in the scene. */
  private rect(word: 0 | 1) {
    const scene = this.scene().nativeElement.getBoundingClientRect();
    const r = (word === 0 ? this.word() : this.foreign()).nativeElement.getBoundingClientRect();
    return {
      left: r.left - scene.left,
      right: r.right - scene.left,
      top: r.top - scene.top,
      bottom: r.bottom - scene.top,
      width: r.width,
      height: r.height,
    };
  }

  /**
   * Lines the card's text up with the word, as WinDict does, keeping it in
   * the scene: under the word, or over it when there's no room under.
   */
  private placeCard() {
    const scene = this.scene().nativeElement;
    const word = this.rect(WORDS[this.mode()]);
    const card = this.card().nativeElement;
    const pad = parseFloat(getComputedStyle(card).paddingLeft) || 0;
    const margin = 12;
    const left = Math.max(margin, Math.min(word.left - pad, scene.clientWidth - card.offsetWidth - margin));
    const over = word.top - 6 - card.offsetHeight;
    let top = word.bottom + 6;
    if (top + card.offsetHeight > scene.clientHeight - margin && over >= margin) top = over;
    this.place.set({ left, top });
  }
}
