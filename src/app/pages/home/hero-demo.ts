import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../../shared/icon';
import { Keys } from '../../shared/keys';

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
  window: string;
  /** The passage, split around the word that's selected. */
  before: string;
  word: string;
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
  terms: Term[];
  tabs: { define: string; translate: string };
  tips: { speak: string; translate: string; back: string; pin: string; swap: string };
}

/**
 * The definitions are the very ones WinDict's dictionaries have: Open English
 * WordNet's for "serene", Wikizionario's for "brezza". The translations are
 * what Google Translate gives for them.
 */
const DEMOS: Record<string, Demo> = {
  en: {
    label: 'WinDict defining and translating “serene”, selected in a book',
    window: 'The Crossing — Chapter 2',
    before: 'The sea lay flat and ',
    word: 'serene',
    after:
      ' under a sky that had finally stopped threatening rain. By the time the ferry cleared the harbour the wind had dropped, and for the first time in days Mara let herself look back at the town.',
    next: 'It looked smaller than she remembered: a row of white houses, the bell tower, the long grey arm of the pier. Somewhere in it her brother was still asleep, and would not know she had gone until the evening.',
    heading: 'Serene',
    pos: 'Adjective',
    senses: [
      { text: 'Not agitated; without losing self-possession.', example: 'Spoke in a calm voice' },
      { text: 'Completely clear and fine.', example: 'Serene skies and a bright blue sea' },
    ],
    similarLabel: 'Similar',
    similar: ['calm', 'unagitated', 'tranquil'],
    source: 'Open English WordNet',
    from: { name: 'English', flag: 'gb' },
    to: { name: 'Italiano', flag: 'it' },
    translation: 'Sereno',
    terms: [
      { text: 'Sereno', back: 'Serene, clear, calm' },
      { text: 'Tranquillo', back: 'Quiet, calm, peaceful' },
      { text: 'Calmo', back: 'Calm, quiet' },
    ],
    tabs: { define: 'Definition', translate: 'Translation' },
    tips: {
      speak: 'Listen',
      translate: 'Translate (Ctrl+T)',
      back: 'Back (Backspace)',
      pin: 'Pin window',
      swap: 'Swap languages',
    },
  },
  it: {
    label: 'WinDict che definisce e traduce “brezza”, selezionata in un libro',
    window: 'Il lungomare — Capitolo 3',
    before: 'Quella sera una ',
    word: 'brezza',
    after:
      ' leggera portava dal porto l’odore del sale e delle reti stese ad asciugare. Sul lungomare l’aria era tiepida, e le prime luci si accendevano lungo la riva.',
    next: 'Giulia si fermò davanti al bar della piazza, dove i pescatori discutevano ancora del tempo di domani. Nessuno fece caso a lei, e per un momento le sembrò di non essere mai partita.',
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
    from: { name: 'Italiano', flag: 'it' },
    to: { name: 'English', flag: 'gb' },
    translation: 'Breeze',
    terms: [
      { text: 'Breeze', back: 'Brezza, venticello' },
      { text: 'Light wind', back: 'Venticello, brezza' },
      { text: 'Wind', back: 'Vento' },
    ],
    tabs: { define: 'Definizione', translate: 'Traduzione' },
    tips: {
      speak: 'Ascolta',
      translate: 'Traduci (Ctrl+T)',
      back: 'Indietro (Backspace)',
      pin: 'Fissa finestra',
      swap: 'Inverti le lingue',
    },
  },
};

/** How long each side of the card shows before it turns, on its own. */
const TURN_MS = 5000;

/**
 * WinDict's card, built in HTML: open under a word selected in a book, it
 * turns from the word's definition to its translation and back, as Ctrl+T
 * does. The visitor can turn it too.
 */
@Component({
  selector: 'app-hero-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, Icon, Keys],
  templateUrl: './hero-demo.html',
  styleUrl: './hero-demo.css',
})
export class HeroDemo {
  protected readonly demo = DEMOS[inject(LOCALE_ID).slice(0, 2)] ?? DEMOS['en'];
  /** The word, a letter at a time, as the selection reaches each. */
  protected readonly letters = [...this.demo.word];
  protected readonly mode = signal<Mode>('define');
  /** Where the card is, under the word; until measured, about there. */
  protected readonly place = signal<{ left: number; top: number } | null>(null);

  private readonly scene = viewChild.required<ElementRef<HTMLElement>>('scene');
  private readonly word = viewChild.required<ElementRef<HTMLElement>>('word');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');

  private timer: ReturnType<typeof setInterval> | undefined;
  private paused = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(this.scene().nativeElement);
      this.measure();
      // Turns by itself, unless the visitor would rather nothing moved.
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.timer = setInterval(() => {
          if (!this.paused) this.mode.update((m) => (m === 'define' ? 'translate' : 'define'));
        }, TURN_MS);
      }
      destroyRef.onDestroy(() => {
        observer.disconnect();
        clearInterval(this.timer);
      });
    });
  }

  /** The visitor chose a side: it stays there. */
  protected show(mode: Mode) {
    clearInterval(this.timer);
    this.mode.set(mode);
  }

  protected pause(paused: boolean) {
    this.paused = paused;
  }

  /** Lines the card's text up with the word, as WinDict does, keeping it in the scene. */
  private measure() {
    const scene = this.scene().nativeElement.getBoundingClientRect();
    const word = this.word().nativeElement.getBoundingClientRect();
    const card = this.card().nativeElement;
    const pad = parseFloat(getComputedStyle(card).paddingLeft) || 0;
    const margin = 12;
    const left = Math.max(
      margin,
      Math.min(word.left - scene.left - pad, scene.width - card.offsetWidth - margin),
    );
    this.place.set({ left, top: word.bottom - scene.top + 6 });
  }
}
