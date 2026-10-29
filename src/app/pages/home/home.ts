import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { IconName } from '../../shared/icons';
import { Keys } from '../../shared/keys';
import { Shot } from '../../shared/shot';
import { Winget } from '../../shared/winget';
import { LANGUAGE_NAMES, RELEASES_URL, REPO_URL } from '../../site';
import { HeroDemo } from './hero-demo';

/** A dictionary WinDict can look words up in. */
interface Dictionary {
  code: string;
  name: string;
  /** Its download, or nothing for English, which is built in. */
  size?: string;
}

interface Feature {
  icon: IconName;
  title: string;
  text: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, Keys, Shot, Winget, HeroDemo],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly repoUrl = REPO_URL;

  protected readonly stats = [
    {
      value: $localize`:@@home.stat.memory.value:4 MB`,
      label: $localize`:@@home.stat.memory.label:of memory while idle`,
    },
    {
      value: $localize`:@@home.stat.words.value:1,100,000+`,
      label: $localize`:@@home.stat.words.label:words and phrases offline, in 6 languages`,
    },
    { value: '22', label: $localize`:@@home.stat.languages.label:languages to translate between` },
    {
      value: $localize`:@@home.stat.speed.value:< 1 ms`,
      label: $localize`:@@home.stat.speed.label:for an offline lookup`,
    },
  ];

  /** The offline dictionaries, in WinDict's order (dicts.rs), each named in itself. */
  protected readonly dictionaries: Dictionary[] = [
    {
      code: 'en',
      name: LANGUAGE_NAMES.en,
    },
    {
      code: 'it',
      name: LANGUAGE_NAMES.it,
      size: $localize`:@@home.languages.it.size:8 MB`,
    },
    {
      code: 'es',
      name: LANGUAGE_NAMES.es,
      size: $localize`:@@home.languages.es.size:17 MB`,
    },
    {
      code: 'fr',
      name: LANGUAGE_NAMES.fr,
      size: $localize`:@@home.languages.fr.size:89 MB`,
    },
    {
      code: 'de',
      name: 'Deutsch',
      size: $localize`:@@home.languages.de.size:45 MB`,
    },
    {
      code: 'pt',
      name: 'Português',
      size: $localize`:@@home.languages.pt.size:8 MB`,
    },
  ];
  protected readonly builtIn = $localize`:@@home.languages.builtIn:Built in`;

  protected readonly features: Feature[] = [
    {
      icon: 'pin',
      title: $localize`:@@home.feature.pin.title:Pin a card`,
      text: $localize`:@@home.feature.pin.text:Pin a definition and it stays on top of everything, wherever you drag it, while new lookups open cards of their own.`,
    },
    {
      icon: 'speaker',
      title: $localize`:@@home.feature.speak.title:Hear it said`,
      text: $localize`:@@home.feature.speak.text:The speaker button says the word out loud in its own language, with the voices Windows already has.`,
    },
    {
      icon: 'arrowSwap',
      title: $localize`:@@home.feature.similar.title:Similar and opposite words`,
      text: $localize`:@@home.feature.similar.text:Each part of speech lists similar words and opposites. Click one to open it in the same card, then go back.`,
    },
    {
      icon: 'search',
      title: $localize`:@@home.feature.type.title:Type it, or read it off the screen`,
      text: $localize`:@@home.feature.type.text:With nothing selected, the shortcut opens a box to type into, with suggestions as you type. Its scan button reads text off the screen, even from a picture.`,
    },
    {
      icon: 'bookSearch',
      title: $localize`:@@home.feature.forms.title:Base forms found for you`,
      text: $localize`:@@home.feature.forms.text:Inflected forms are looked up by their base word, so “ran” shows “run”. Misspelled? The card asks what you meant.`,
    },
    {
      icon: 'theme',
      title: $localize`:@@home.feature.theme.title:Your theme, your accent`,
      text: $localize`:@@home.feature.theme.text:The card follows Windows' light or dark mode and accent color, on Mica-like acrylic, like the rest of the system.`,
    },
    {
      icon: 'textSize',
      title: $localize`:@@home.feature.size.title:Text the size you like`,
      text: $localize`:@@home.feature.size.text:From 80% to 200%, with Ctrl+plus, Ctrl+minus or Ctrl and the mouse wheel. The size is remembered.`,
    },
    {
      icon: 'sync',
      title: $localize`:@@home.feature.update.title:Updates itself`,
      text: $localize`:@@home.feature.update.text:Once a day WinDict checks for a new version. When there is one, the tray icon shows a dot and the update is one click away.`,
    },
  ];

  protected readonly faqs = [
    {
      q: $localize`:@@home.faq.free.q:Is WinDict free?`,
      a: $localize`:@@home.faq.free.a:Yes. WinDict is free and open source under the MIT license, with no ads, accounts or tracking.`,
    },
    {
      q: $localize`:@@home.faq.smartscreen.q:Why does Windows warn me when I run it?`,
      a: $localize`:@@home.faq.smartscreen.a:WinDict isn't commercially signed, so the first time SmartScreen may ask for confirmation. Choose “More info”, then “Run anyway”.`,
    },
    {
      q: $localize`:@@home.faq.offline.q:Does it work offline?`,
      a: $localize`:@@home.faq.offline.a:English definitions are built in and work without a connection. Italian, Spanish, French, German and Portuguese do too, once their dictionaries are downloaded. Translations, and words no downloaded dictionary has, need the internet.`,
    },
    {
      q: $localize`:@@home.faq.network.q:What does it send over the network?`,
      a: $localize`:@@home.faq.network.a:Only what you ask for: the word, when it's looked up online, and the text, when it's translated. WinDict also checks GitHub for a new version once a day. Both the online dictionary, which translations need, and the update check can be turned off in the settings.`,
    },
    {
      q: $localize`:@@home.faq.languages.q:Which languages does it speak?`,
      a: $localize`:@@home.faq.languages.a:Definitions in English, Italian, Spanish, French, German and Portuguese, with more languages coming soon. Translations between 22 languages. And the app itself is in all six of them.`,
    },
    {
      q: $localize`:@@home.faq.windows.q:Which versions of Windows does it run on?`,
      a: $localize`:@@home.faq.windows.a:Windows 10 and 11. Older versions might work, but they aren't tested.`,
    },
    {
      q: $localize`:@@home.faq.portable.q:Do I have to install it?`,
      a: $localize`:@@home.faq.portable.a:No. There's a single executable that runs from anywhere. Installing it with the setup adds it to Start and lets the card show above the Start menu.`,
    },
  ];

  /** The questions whose answers are open. */
  protected readonly open = signal(new Set<number>());

  protected toggle(index: number) {
    this.open.update((open) => {
      const next = new Set(open);
      if (!next.delete(index)) next.add(index);
      return next;
    });
  }
}
