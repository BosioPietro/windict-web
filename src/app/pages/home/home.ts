import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { IconName } from '../../shared/icons';
import { Keys } from '../../shared/keys';
import { Shot } from '../../shared/shot';
import { RELEASES_URL, REPO_URL } from '../../site';

interface Feature {
  icon: IconName;
  title: string;
  text: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Keys, Shot],
  templateUrl: './home.html',
})
export class Home {
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly repoUrl = REPO_URL;

  protected readonly stats = [
    {
      value: $localize`:@@home.stat.memory.value:3 MB`,
      label: $localize`:@@home.stat.memory.label:of memory while idle`,
    },
    {
      value: $localize`:@@home.stat.words.value:150,000`,
      label: $localize`:@@home.stat.words.label:English words and phrases, offline`,
    },
    { value: '22', label: $localize`:@@home.stat.languages.label:languages to translate between` },
    {
      value: $localize`:@@home.stat.speed.value:< 1 ms`,
      label: $localize`:@@home.stat.speed.label:for an offline lookup`,
    },
  ];

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
      title: $localize`:@@home.feature.type.title:Type a word`,
      text: $localize`:@@home.feature.type.text:With nothing selected, the shortcut opens a box to type into, with suggestions from the offline dictionary as you type.`,
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
      a: $localize`:@@home.faq.offline.a:English definitions are built in and work without a connection. Italian works offline once its dictionary is downloaded. Translations, and words the built-in dictionaries don't have, need the internet.`,
    },
    {
      q: $localize`:@@home.faq.network.q:What does it send over the network?`,
      a: $localize`:@@home.faq.network.a:Only what you ask for: the word, when it's looked up online, and the text, when it's translated. WinDict also checks GitHub for a new version once a day. Both the online dictionary, which translations need, and the update check can be turned off in the settings.`,
    },
    {
      q: $localize`:@@home.faq.languages.q:Which languages does it have?`,
      a: $localize`:@@home.faq.languages.a:Definitions in English and Italian, translations between 22 languages, and the app itself in English and Italian.`,
    },
    {
      q: $localize`:@@home.faq.portable.q:Do I have to install it?`,
      a: $localize`:@@home.faq.portable.a:No. There's a single executable that runs from anywhere. Installing it with the setup adds it to Start and lets the card show above the Start menu.`,
    },
  ];
}
