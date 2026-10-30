import { Component, inject } from '@angular/core';
import { Icon } from '../../shared/icon';
import { LANGUAGE } from '../../shared/language';
import { DEMOS } from './hero-demo-content';

/** An article as WinDict shows it: what each language's Wikipedia has for Kyoto. */
interface Article {
  title: string;
  description: string;
  /** The summary's opening, cut at the last sentence within 420 characters (wikipedia.rs). */
  extract: string;
  url: string;
  /** The link to the rest, as WinDict names it. */
  link: string;
  /** The credits under the card. */
  textFrom: string;
  photoBy: string;
}

const ARTICLES: Record<string, Article> = {
  en: {
    title: 'Kyoto',
    description: 'City in the Kansai region of Japan',
    extract:
      "Kyoto, officially Kyoto City , is the capital city of Kyoto Prefecture in the Kansai region of Japan's largest and most populous island of Honshu. As of 2020, the city had a population of 1.46 million, making it the ninth-most populous city in Japan. More than half (56.8%) of Kyoto Prefecture's population resides in the city.",
    url: 'https://en.wikipedia.org/wiki/Kyoto',
    link: 'Wikipedia',
    textFrom: 'Text from Wikipedia:',
    photoBy: 'Photo by',
  },
  it: {
    title: 'Kyoto',
    description: 'città del Giappone',
    extract:
      "Kyoto è una città del Giappone di quasi 1,46 milioni di abitanti, capoluogo dell'omonima prefettura.",
    url: 'https://it.wikipedia.org/wiki/Kyoto',
    link: 'Wikipedia',
    textFrom: 'Testo da Wikipedia:',
    photoBy: 'Foto di',
  },
  es: {
    title: 'Kioto',
    description: 'ciudad en la prefectura de Kyoto, Japón',
    extract:
      'Kioto es una ciudad de Japón, localizada en la parte central de la isla de Honshu. Es la capital de la prefectura homónima y tradicionalmente también ha sido considerada capital de la región de Kansai, aunque esta sea solo una referencia geográfica más que un territorio administrativo concreto.',
    url: 'https://es.wikipedia.org/wiki/Kioto',
    link: 'Wikipedia',
    textFrom: 'Texto de Wikipedia:',
    photoBy: 'Foto de',
  },
  fr: {
    title: 'Kyoto',
    description: 'ville japonaise, capitale de la préfecture de Kyoto',
    extract:
      "Kyoto ou Kyōto (京都市, Kyōto-shi, littéralement « ville capitale ») est une ville japonaise de la région du Kansai, au centre de Honshū en Asie. Elle fut de 794 à 1868 la capitale impériale du Japon, sous le nom de Heian-kyō. Elle est aujourd'hui, avec ses palais impériaux, ses milliers de sanctuaires shinto et de temples bouddhistes, le cœur culturel et religieux du pays.",
    url: 'https://fr.wikipedia.org/wiki/Kyoto',
    link: 'Wikipédia',
    textFrom: 'Texte de Wikipédia :',
    photoBy: 'Photo de',
  },
  de: {
    title: 'Kyōto',
    description: 'japanische Großstadt',
    extract:
      'Kyōto, im Deutschen auch Kioto geschrieben, ist eine der geschichtlich und kulturell bedeutendsten Städte Japans. Sie liegt im Südwesten der japanischen Hauptinsel Honshū im Ballungsgebiet Kansai. Beide Schriftzeichen des heutigen Stadtnamens werden alleine jeweils „Miyako“ gelesen und bedeuten im Japanischen wörtlich „kaiserliche Residenz“.',
    url: 'https://de.wikipedia.org/wiki/Ky%C5%8Dto',
    link: 'Wikipedia',
    textFrom: 'Text aus Wikipedia:',
    photoBy: 'Foto von',
  },
  pt: {
    title: 'Quioto',
    description: 'cidade na prefeitura de Quioto, no Japão',
    extract:
      'Quioto é uma cidade do Japão, capital da prefeitura de Quioto, localizada na região Kansai, no centro-sul do país. Fundada no século I, por mais de um milênio foi a capital da Corte Imperial do Japão, de 794 a 1868, quando foi substituída por Tóquio.',
    url: 'https://pt.wikipedia.org/wiki/Quioto',
    link: 'Wikipédia',
    textFrom: 'Texto da Wikipédia:',
    photoBy: 'Foto de',
  },
};

/** The English article's picture, which every language shows. */
const PHOTO_URL =
  'https://commons.wikimedia.org/wiki/File:Kiyomizu-dera,_Kyoto,_November_2016_-02.jpg';

/** WinDict's card for a name the dictionaries skip, answered from Wikipedia. */
@Component({
  selector: 'app-wiki-card',
  imports: [Icon],
  templateUrl: './wiki-card.html',
  styleUrl: './wiki-card.css',
})
export class WikiCard {
  private readonly language = inject(LANGUAGE);
  protected readonly article = ARTICLES[this.language] ?? ARTICLES['en'];
  protected readonly pinTip = (DEMOS[this.language] ?? DEMOS['en']).tips.pin;
  protected readonly photoUrl = PHOTO_URL;
}
