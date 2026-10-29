interface Sense {
  text: string;
  example?: string;
}

interface Term {
  text: string;
  back: string;
}

type Flag = 'gb' | 'it' | 'es' | 'fr' | 'de' | 'br';

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
  from: { name: string; flag: Flag };
  to: { name: string; flag: Flag };
  translation: string;
  /** The foreign word's part of speech, named in WinDict's language. */
  foreignPos: string;
  terms: Term[];
  tips: { speak: string; translate: string; pin: string; swap: string };
}

/**
 * The definitions are the very ones WinDict's dictionaries have: Open English
 * WordNet's for "serene", Wikizionario's for "brezza", Wikcionario's for
 * "apacible", Wiktionnaire's for "flâner", the German Wiktionary's for
 * "bummeln" and Wikcionário's for "passear". The translations are what Google
 * Translate gives for "passeggiata", "cosy", "quaint" and "charming".
 */
export const DEMOS: Record<string, Demo> = {
  en: {
    label:
      'WinDict defining “serene” and translating “passeggiata”, both selected in a travel article',
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
    after:
      ' come il salotto di casa: legno scuro, il camino acceso e una pinta che nessuno ha fretta di finire.',
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
  es: {
    label:
      'WinDict definiendo “apacible” y traduciendo “cosy”, seleccionadas en un artículo de viajes',
    page: 'Los Cotswolds en otoño, a paso lento',
    site: 'postales.example/cotswolds',
    before: 'Al caer la tarde, el pueblo recupera su ritmo ',
    word: 'apacible',
    between:
      ': las casas de piedra dorada se encienden una a una y el pub junto al río se vuelve tan ',
    foreign: 'cosy',
    after:
      ' como un salón de casa, con la chimenea encendida y una pinta que nadie tiene prisa por terminar.',
    next: 'Por la mañana merece la pena seguir el sendero entre Bourton-on-the-Water y los Slaughters, cruzando prados y puentecillos de piedra, sin más plan que llegar a tiempo para el té.',
    heading: 'Apacible',
    pos: 'Adjetivo',
    senses: [
      { text: 'Manso, dulce y agradable en la condición y el trato.' },
      {
        text: 'De buen temple, tranquilo, agradable.',
        example: 'Un día apacible, un viento apacible.',
      },
    ],
    similarLabel: 'Sinónimos',
    similar: ['grato', 'manso', 'plácido', 'calmado'],
    source: 'Wikcionario',
    from: { name: 'English', flag: 'gb' },
    to: { name: 'Español', flag: 'es' },
    translation: 'Acogedor',
    foreignPos: 'Adjetivo',
    terms: [
      { text: 'Acogedor', back: 'Cozy, friendly, homely, cheery' },
      { text: 'Cómodo', back: 'Comfortable, convenient, easy, cozy' },
      { text: 'Amistoso', back: 'Friendly, amicable, amiable, neighborly' },
    ],
    tips: {
      speak: 'Escuchar',
      translate: 'Traducir (Ctrl+T)',
      pin: 'Anclar ventana',
      swap: 'Intercambiar idiomas',
    },
  },
  fr: {
    label:
      'WinDict définissant « flâner » et traduisant « quaint », sélectionnés dans un article de voyage',
    page: 'Un week-end à York, au fil des ruelles',
    site: 'cartes-postales.example/york',
    before: 'Le dimanche matin, rien de tel que de ',
    word: 'flâner',
    between: ' dans les Shambles, une ruelle médiévale bordée de boutiques ',
    foreign: 'quaint',
    after:
      ' aux façades de bois penchées, où l’on s’arrête pour un scone encore tiède ou une vitrine de vieux livres.',
    next: 'L’après-midi, faites le tour des remparts à pied : en une heure à peine, la ville entière défile sous vos yeux, de la cathédrale aux jardins qui bordent la rivière.',
    heading: 'Flâner',
    pos: 'Verbe',
    senses: [
      { text: 'Se promener sans but, sans hâte et sans objet déterminé.' },
      {
        text: 'Passer son temps à des bagatelles.',
        example: 'Je flâne toute la journée avant de commencer mes travaux scolaires.',
      },
    ],
    similarLabel: 'Synonymes',
    similar: ['lambiner', 'déambuler', 'errer'],
    source: 'Wiktionnaire',
    from: { name: 'English', flag: 'gb' },
    to: { name: 'Français', flag: 'fr' },
    translation: 'Pittoresque',
    foreignPos: 'Adjectif',
    terms: [
      { text: 'Pittoresque', back: 'Picturesque, quaint' },
      { text: 'Original', back: 'Original, novel, quaint, eccentric' },
      { text: 'Vieillot', back: 'Quaint, antiquated' },
    ],
    tips: {
      speak: 'Écouter',
      translate: 'Traduire (Ctrl+T)',
      pin: 'Épingler la fenêtre',
      swap: 'Inverser les langues',
    },
  },
  de: {
    label:
      'WinDict definiert „bummeln“ und übersetzt „quaint“, beide markiert in einem Reiseartikel',
    page: 'Ein Wochenende in Bath, ganz ohne Eile',
    site: 'postkarten.example/bath',
    before: 'Am Samstagvormittag lässt es sich herrlich durch die Gassen der Altstadt ',
    word: 'bummeln',
    between: ', vorbei an Teestuben und kleinen Läden, so ',
    foreign: 'quaint',
    after:
      ', wie man sie aus alten Romanen kennt: Sprossenfenster, knarrende Dielen und Scones, die noch warm aus dem Ofen kommen.',
    next: 'Am Nachmittag lohnt ein Abstecher zu den Römischen Bädern, und wer danach noch Lust hat, spaziert am Royal Crescent entlang bis in den Park, wo die halbe Stadt in der Sonne sitzt.',
    heading: 'Bummeln',
    pos: 'Verb',
    senses: [
      { text: 'Langsam spazieren gehen.', example: 'Wir bummeln ohne Ziel durch die Stadt.' },
      { text: 'Nichts weiterbringen, nichts tun.' },
    ],
    similarLabel: 'Ähnlich',
    similar: ['flanieren', 'promenieren', 'schlendern'],
    source: 'Deutsches Wiktionary',
    from: { name: 'English', flag: 'gb' },
    to: { name: 'Deutsch', flag: 'de' },
    translation: 'Malerisch',
    foreignPos: 'Adjektiv',
    terms: [
      { text: 'Malerisch', back: 'Picturesque, quaint, scenic, pictorial' },
      { text: 'Urig', back: 'Quaint, ethnic, earthly' },
      { text: 'Idyllisch', back: 'Idyllic, quaint, pastoral' },
    ],
    tips: {
      speak: 'Anhören',
      translate: 'Übersetzen (Strg+T)',
      pin: 'Fenster anheften',
      swap: 'Sprachen tauschen',
    },
  },
  pt: {
    label: 'WinDict definindo “passear” e traduzindo “charming”, selecionadas num artigo de viagem',
    page: 'Um fim de semana em Cambridge, sem pressa',
    site: 'cartoes-postais.example/cambridge',
    before: 'No domingo de manhã, o melhor programa é ',
    word: 'passear',
    between: ' à beira do rio Cam, entre faculdades antigas e pontes de pedra, e parar num café ',
    foreign: 'charming',
    after: ' de janelas pequenas, onde os scones chegam ainda quentes, com geleia e creme.',
    next: 'À tarde, vale a pena alugar um barco e descer o rio devagar: em pouco mais de uma hora, a cidade inteira passa diante dos seus olhos, dos jardins às torres das capelas.',
    heading: 'Passear',
    pos: 'Verbo',
    senses: [{ text: 'Andar.' }, { text: 'Caminhar ou viajar a passeio.' }],
    similarLabel: 'Sinônimos',
    similar: ['flanar', 'excursionar'],
    source: 'Wikcionário',
    from: { name: 'English', flag: 'gb' },
    to: { name: 'Português', flag: 'br' },
    translation: 'Encantador',
    foreignPos: 'Adjetivo',
    terms: [
      { text: 'Encantador', back: 'Lovely, charming, enchanting, delightful' },
      { text: 'Charmoso', back: 'Charming, charmer, good-looking' },
      { text: 'Fascinante', back: 'Fascinating, glamorous, charming, lovely' },
    ],
    tips: {
      speak: 'Ouvir',
      translate: 'Traduzir (Ctrl+T)',
      pin: 'Fixar janela',
      swap: 'Inverter idiomas',
    },
  },
};
