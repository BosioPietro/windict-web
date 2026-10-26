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
export const DEMOS: Record<string, Demo> = {
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
