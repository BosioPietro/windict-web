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
import { DEMOS } from './hero-demo-content';

type Mode = 'define' | 'translate';

/** The word looked up is the first in the passage; the foreign one, the second. */
const WORDS: Record<Mode, 0 | 1> = { define: 0, translate: 1 };

/** How long the visitor has to take in the page before anything moves. */
const START_MS = 1200;
/** How long a card stays open before it's clicked away. */
const HOLD_MS = 3500;
/** How long the drag takes over each letter of the foreign word. */
const LETTER_MS = 70;

interface Point {
  x: number;
  y: number;
}

/** Eases in and out, smoothly: a minimum-jerk curve. */
const steady = (t: number) => t * t * t * (10 - 15 * t + 6 * t * t);
/** As a hand reaches for something: off quickly, then a long slowing in. */
const reach = (t: number) => steady(1 - (1 - t) ** 1.6);
/**
 * As a hand drags across text: it gathers speed over the first quarter, holds
 * it, and lets it go over the last third, each ramp a half cosine.
 */
const cruise = (t: number, up = 0.25, down = 0.35) => {
  const wave = (u: number, of: number) => (of / Math.PI) * Math.sin((Math.PI * u) / of);
  const at =
    t < up
      ? (t - wave(t, up)) / 2
      : t <= 1 - down
        ? up / 2 + (t - up)
        : 1 - up / 2 - down + (t - 1 + down + wave(t - 1 + down, down)) / 2;
  return at / (1 - (up + down) / 2);
};
/** `n`, give or take a share of it, so no two runs are quite the same. */
const vary = (n: number, by = 0.15) => n * (1 - by + Math.random() * 2 * by);
/** Anywhere up to `px` either way. */
const jitter = (px: number) => (Math.random() * 2 - 1) * px;

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
  protected readonly defining = computed(() => this.mode() === 'define');
  /** The card's title: the word defined, or the one translated. */
  protected readonly heading = computed(() =>
    this.defining() ? this.demo.heading : this.demo.foreign,
  );
  /** How many letters of which word are selected, and how wide they are. */
  private readonly selection = signal<{
    word: 0 | 1;
    count: number;
    width: number;
    dragged: boolean;
  } | null>(null);
  /** Each word's selected letters, and the size of the highlight under them. */
  protected readonly selected = computed(() => {
    const s = this.selection();
    return [0, 1].map((word) => {
      const { count, width, dragged } =
        s?.word === word ? s : { count: 0, width: 0, dragged: false };
      return { count, dragged: dragged && count > 0, size: `${width}px 100%` };
    });
  });
  protected readonly open = signal(false);
  /** Where the card is, under the word; until measured, about there. */
  protected readonly place = signal<{ left: number; top: number } | null>(null);
  /** The pointer: where it is, and whether it's on the scene yet. */
  protected readonly pointer = signal({ x: 0, y: 0, shown: false });
  protected readonly pointerTransform = computed(
    () => `translate(${this.pointer().x}px, ${this.pointer().y}px)`,
  );
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
    this.pointer.set({
      x: scene.clientWidth * 0.55,
      y: scene.clientHeight - 30,
      shown: false,
    });
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
    const middle = {
      x: word.left + word.width * vary(0.55, 0.2),
      y: word.top + word.height / 2 + jitter(2),
    };
    if (!((await this.move(middle, live)) && (await this.sleep(vary(220, 0.3), live))))
      return false;
    this.click();
    if (!(await this.sleep(vary(110, 0.25), live))) return false;
    this.click();
    this.select(0, this.letters[0].length);
    return this.press('Alt+D', live);
  }

  /** Drags across the foreign word, presses Alt+T, reads, presses Esc. */
  private async translate(live: () => boolean) {
    this.mode.set('translate');
    const word = this.rect(1);
    const y = word.top + word.height / 2 + jitter(2);
    if (!(
      (await this.move({ x: word.left + 1, y }, live)) && (await this.sleep(vary(260, 0.3), live))
    ))
      return false;
    // A letter is selected once the pointer is past its middle, as in any text.
    const scene = this.scene().nativeElement.getBoundingClientRect();
    const middles = [...this.foreign().nativeElement.querySelectorAll('.letter')].map((letter) => {
      const r = letter.getBoundingClientRect();
      return r.left + r.width / 2 - scene.left;
    });
    this.select(1, 0);
    const step = ({ x }: Point) => {
      const count = middles.filter((m) => m < x).length;
      if (count !== this.selection()?.count) this.select(1, count, true);
    };
    // The drag gathers speed, keeps it across the word, wandering a little
    // off the line, and slows to a stop just past it.
    const end = { x: word.right + vary(3, 0.6), y: y + jitter(2) };
    const dragged = await this.glide(end, vary(this.letters[1].length * LETTER_MS, 0.1), live, {
      ease: cruise,
      bow: 0.03,
      step,
    });
    return dragged && (await this.sleep(150, live)) && this.press('Alt+T', live);
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

  /**
   * Moves the pointer as a hand would: the farther, the longer it takes, on a
   * slight curve.
   */
  private move(to: Point, live: () => boolean) {
    const { x, y } = this.pointer();
    const distance = Math.hypot(to.x - x, to.y - y);
    return this.glide(to, vary(Math.min(450 + distance * 1.3, 1000)), live);
  }

  /**
   * Glides the pointer to `to` in `ms`, a frame at a time, along a curve that
   * bows `bow` of the way out to one side, telling `step` each place it passes.
   */
  private glide(
    to: Point,
    ms: number,
    live: () => boolean,
    { ease = reach, bow = vary(0.12, 0.4), step = (_: Point) => {} } = {},
  ) {
    const from = this.pointer();
    const side = Math.random() < 0.5 ? -1 : 1;
    const bend = {
      x: (from.x + to.x) / 2 - (to.y - from.y) * bow * side,
      y: (from.y + to.y) / 2 + (to.x - from.x) * bow * side,
    };
    const start = performance.now();
    return new Promise<boolean>((resolve) => {
      const frame = (now: number) => {
        if (!live()) return resolve(false);
        const t = Math.min(1, (now - start) / ms);
        const s = ease(t);
        // A quadratic Bézier from where it is, through the bend, to `to`.
        const at = {
          x: (1 - s) ** 2 * from.x + 2 * (1 - s) * s * bend.x + s ** 2 * to.x,
          y: (1 - s) ** 2 * from.y + 2 * (1 - s) * s * bend.y + s ** 2 * to.y,
        };
        this.pointer.update((p) => ({ ...p, ...at }));
        step(at);
        if (t < 1) requestAnimationFrame(frame);
        else resolve(true);
      };
      requestAnimationFrame(frame);
    });
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
    // Timed by the clock, not by counting ticks: a throttled timer, as in a
    // tab in the background, would otherwise stretch it many times over.
    for (let left = ms, last = performance.now(); left > 0;) {
      if (!(await this.sleep(Math.min(left, 100), live))) return false;
      const now = performance.now();
      if (!this.paused) left -= now - last;
      last = now;
    }
    return true;
  }

  /**
   * Selects the word's first `count` letters. The selection is drawn under
   * the whole word at once, not letter by letter, or each letter's would
   * cover the tail of the one before.
   */
  private select(word: 0 | 1, count: number, dragged = false) {
    const letters = (word === 0 ? this.word() : this.foreign()).nativeElement.querySelectorAll(
      '.letter',
    );
    const width = count
      ? letters[count - 1].getBoundingClientRect().right - letters[0].getBoundingClientRect().left
      : 0;
    this.selection.set({ word, count, width, dragged });
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
    const left = Math.max(
      margin,
      Math.min(word.left - pad, scene.clientWidth - card.offsetWidth - margin),
    );
    const over = word.top - 6 - card.offsetHeight;
    let top = word.bottom + 6;
    if (top + card.offsetHeight > scene.clientHeight - margin && over >= margin) top = over;
    this.place.set({ left, top });
  }
}
