import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found';

/** A docs page: its title in search results and the tab, and its description. */
const docs = (searchTitle: string, description: string) => ({
  title: `${searchTitle} · WinDict`,
  data: { description },
});

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: $localize`:@@title.home:Free dictionary and translator for Windows · WinDict`,
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs-layout').then((m) => m.DocsLayout),
    loadChildren: () =>
      import('./pages/docs/pages').then((m) => [
        { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
        {
          path: 'getting-started',
          component: m.GettingStarted,
          ...docs(
            $localize`:@@title.docs.gettingStarted:Install the free dictionary for Windows 10 and 11`,
            $localize`:@@desc.start:How to install WinDict on Windows, or run it without installing, and look up your first word.`,
          ),
        },
        {
          path: 'looking-up-words',
          component: m.LookingUpWords,
          ...docs(
            $localize`:@@title.docs.lookingUp:Look up any word on Windows with Alt+D`,
            $localize`:@@desc.lookup:Look up any word on Windows with Alt+D: definitions, similar and opposite words, pronunciation, pinned cards and more.`,
          ),
        },
        {
          path: 'translating',
          component: m.Translating,
          ...docs(
            $localize`:@@title.docs.translating:Translate selected text on Windows with Alt+T`,
            $localize`:@@desc.translate:Translate a word, a phrase or a whole passage on Windows with Alt+T, between 22 languages.`,
          ),
        },
        {
          path: 'shortcuts',
          component: m.Shortcuts,
          ...docs(
            $localize`:@@title.docs.shortcuts:Keyboard shortcuts for looking up and translating`,
            $localize`:@@desc.keys:Every keyboard shortcut in WinDict, from anywhere in Windows and on the card.`,
          ),
        },
        {
          path: 'command-line',
          component: m.CommandLine,
          ...docs(
            $localize`:@@title.docs.commandLine:wd: look up and translate from the Windows terminal`,
            $localize`:@@desc.cli:Look up and translate words from a Windows terminal with wd, WinDict's command line: its commands, options and exit codes.`,
          ),
        },
        {
          path: 'above-start',
          component: m.AboveStart,
          ...docs(
            $localize`:@@title.docs.aboveStart:Look up words above the Windows Start menu`,
            $localize`:@@desc.above:How WinDict shows its card on top of the Windows Start menu and Search, with UI access.`,
          ),
        },
        {
          path: 'settings',
          component: m.Settings,
          ...docs(
            $localize`:@@title.docs.settings:Settings and the config.json file`,
            $localize`:@@desc.settings:Every setting in WinDict, the dictionary and translator for Windows: general, card, lookup and translation, and the settings file that keeps them.`,
          ),
        },
        {
          path: 'dictionaries',
          component: m.Dictionaries,
          ...docs(
            $localize`:@@title.docs.dictionaries:Offline dictionaries, sources and network use`,
            $localize`:@@desc.dicts:Where WinDict's definitions and translations come from, and what it sends over the network.`,
          ),
        },
        {
          path: 'building',
          component: m.Building,
          ...docs(
            $localize`:@@title.docs.building:Build from source with Rust and Inno Setup`,
            $localize`:@@desc.build:How to build WinDict and its setup from source, with Rust and Inno Setup.`,
          ),
        },
      ]),
  },
  {
    path: '404',
    component: NotFound,
    title: $localize`:@@title.notFound:Page not found · WinDict`,
    data: { noindex: true },
  },
  {
    path: '**',
    component: NotFound,
    title: $localize`:@@title.notFound:Page not found · WinDict`,
    data: { noindex: true },
  },
];
