import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found';

const docs = (title: string, description: string) => ({
  title: `${title} · WinDict`,
  data: { description },
});

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: $localize`:@@title.home:WinDict · Look up and translate any word on Windows`,
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
            $localize`:@@docs.nav.gettingStarted:Getting started`,
            $localize`:@@desc.start:How to install WinDict on Windows, or run it without installing, and look up your first word.`,
          ),
        },
        {
          path: 'looking-up-words',
          component: m.LookingUpWords,
          ...docs(
            $localize`:@@docs.nav.lookingUp:Looking up words`,
            $localize`:@@desc.lookup:Look up any word on Windows with Alt+D: definitions, similar and opposite words, pronunciation, pinned cards and more.`,
          ),
        },
        {
          path: 'translating',
          component: m.Translating,
          ...docs(
            $localize`:@@docs.nav.translating:Translating`,
            $localize`:@@desc.translate:Translate a word, a phrase or a whole passage on Windows with Alt+T, between 22 languages.`,
          ),
        },
        {
          path: 'shortcuts',
          component: m.Shortcuts,
          ...docs(
            $localize`:@@docs.nav.shortcuts:Keyboard shortcuts`,
            $localize`:@@desc.keys:Every keyboard shortcut in WinDict, from anywhere in Windows and on the card.`,
          ),
        },
        {
          path: 'above-start',
          component: m.AboveStart,
          ...docs(
            $localize`:@@docs.nav.aboveStart:Above the Start menu`,
            $localize`:@@desc.above:How WinDict shows its card on top of the Windows Start menu and Search, with UI access.`,
          ),
        },
        {
          path: 'settings',
          component: m.Settings,
          ...docs(
            $localize`:@@docs.nav.settings:Settings`,
            $localize`:@@desc.settings:Every setting in WinDict, and its settings file.`,
          ),
        },
        {
          path: 'dictionaries',
          component: m.Dictionaries,
          ...docs(
            $localize`:@@docs.nav.dictionaries:Dictionaries and network use`,
            $localize`:@@desc.dicts:Where WinDict's definitions and translations come from, and what it sends over the network.`,
          ),
        },
        {
          path: 'building',
          component: m.Building,
          ...docs(
            $localize`:@@docs.nav.building:Building from source`,
            $localize`:@@desc.build:How to build WinDict and its setup from source, with Rust and Inno Setup.`,
          ),
        },
      ]),
  },
  {
    path: '404',
    component: NotFound,
    title: $localize`:@@title.notFound:Page not found · WinDict`,
  },
  { path: '**', component: NotFound, title: $localize`:@@title.notFound:Page not found · WinDict` },
];
