import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Keys } from '../../shared/keys';
import { Shot } from '../../shared/shot';
import { Winget } from '../../shared/winget';
import { RELEASES_URL, REPO_URL } from '../../site';

/** What every docs page can use in its template. */
abstract class DocPage {
  protected readonly releasesUrl = RELEASES_URL;
  protected readonly repoUrl = REPO_URL;
}

@Component({
  imports: [RouterLink, Keys, Shot, Winget],
  templateUrl: './getting-started.html',
})
export class GettingStarted extends DocPage {}

@Component({
  imports: [RouterLink, Keys, Shot],
  templateUrl: './looking-up-words.html',
})
export class LookingUpWords extends DocPage {}

@Component({ imports: [Keys, Shot], templateUrl: './translating.html' })
export class Translating extends DocPage {
  /** As the card lists them, each in itself (translate.rs). */
  protected readonly languages = [
    'English',
    'Italiano',
    'Français',
    'Deutsch',
    'Español',
    'Português',
    'Nederlands',
    'Svenska',
    'Dansk',
    'Norsk',
    'Suomi',
    'Polski',
    'Čeština',
    'Română',
    'Magyar',
    'Ελληνικά',
    'Türkçe',
    'Русский',
    'Українська',
    '日本語',
    '한국어',
    '中文',
  ];
}

@Component({ imports: [Keys], templateUrl: './shortcuts.html' })
export class Shortcuts extends DocPage {}

@Component({ imports: [RouterLink, Keys], templateUrl: './command-line.html' })
export class CommandLine extends DocPage {}

@Component({ imports: [RouterLink, Shot], templateUrl: './above-start.html' })
export class AboveStart extends DocPage {}

@Component({ imports: [RouterLink, Keys], templateUrl: './settings.html' })
export class Settings extends DocPage {}

@Component({ imports: [Shot], templateUrl: './dictionaries.html' })
export class Dictionaries extends DocPage {}

@Component({ templateUrl: './building.html' })
export class Building extends DocPage {}
