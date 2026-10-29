# windict-web

The website of [WinDict](https://github.com/BosioPietro/WinDict), live at
[windict.bosio.zip](https://windict.bosio.zip): a landing page and the docs,
in English, Italian, Spanish and French.

## WinDict

WinDict is a small, free and open-source dictionary for Windows 10 and 11.
Select a word in any app and press <kbd>Alt</kbd>+<kbd>D</kbd>: its definition
opens in a card right beside it. <kbd>Alt</kbd>+<kbd>T</kbd> translates the
selection instead, a word, a phrase or up to 500 characters, into any of 22
languages.

- **Offline and instant.** Over 150,000 English words and phrases from Open
  English WordNet are built into the executable. Italian, Spanish, French,
  German and Portuguese dictionaries, from each language's Wiktionary, are a
  one-time download, and more languages are on the way. An online dictionary
  (Wiktionary) covers pronunciations and the words none of them has.
- **Above the Start menu.** Installed with its setup, WinDict has UI access and
  can show its card on top of Start and Search.
- **Light.** Written in Rust against the native Windows APIs, it uses about
  4 MB of memory while it waits in the notification area.

It installs from its [releases](https://github.com/BosioPietro/WinDict/releases/latest)
or with WinGet:

```sh
winget install BosioPietro.WinDict
```

## The site

| Page                                    | What's on it                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `/{en,it,es,fr}/`                       | The landing page: a live demo of the card, the features, the setup steps      |
| `/{en,it,es,fr}/docs/getting-started/`  | Installing, with the setup, WinGet or the single executable; the first lookup |
| `/{en,it,es,fr}/docs/looking-up-words/` | The definition card                                                           |
| `/{en,it,es,fr}/docs/translating/`      | Translations and their languages                                              |
| `/{en,it,es,fr}/docs/shortcuts/`        | Every key WinDict listens for                                                 |
| `/{en,it,es,fr}/docs/above-start/`      | UI access, and showing the card above Start                                   |
| `/{en,it,es,fr}/docs/settings/`         | The settings window and `config.json`                                         |
| `/{en,it,es,fr}/docs/dictionaries/`     | Where definitions come from, and what goes over the network                   |
| `/{en,it,es,fr}/docs/building/`         | Building WinDict and its setup from source                                    |

It's an [Angular](https://angular.dev) 22 app, styled with
[Tailwind CSS](https://tailwindcss.com) 4 after Microsoft's Fluent 2 design,
and prerendered to static pages (Angular SSG) for Cloudflare Pages. There's no
server: every page is plain HTML, with Angular taking over in the browser for
the hero's demo, the theme-aware screenshots and the copy buttons.

```
src/
├── app/
│   ├── site.ts          # links, the WinGet id, the languages, the docs' table of contents
│   ├── app.routes.ts    # the pages, and their titles
│   ├── seo.ts           # descriptions, canonical and hreflang links, Open Graph
│   ├── layout/          # header and footer
│   ├── pages/
│   │   ├── home/        # the landing page, and the hero's animated card
│   │   └── docs/        # one template per docs page, and their sidebar layout
│   └── shared/          # icons, key caps, screenshots, the WinGet command
├── locale/              # messages.json (English), and .it, .es, .fr
└── styles.css           # Tailwind, and the Fluent colors for light and dark
scripts/
├── postbuild.mjs        # finishes the static site for Cloudflare Pages
└── check-i18n.mjs       # checks the translations against the English
public/                  # favicon, Open Graph image, screenshots
```

## Developing

Needs Node.js 22.22.3 or newer (`.node-version` asks for 24).

```sh
npm install
npm start          # http://localhost:4200, in English
npm run start:it   # the same, in Italian
npm run start:es   # in Spanish
npm run start:fr   # in French
```

The dev server serves one language at a time; the build has all four.

TypeScript is strict, templates included. Format with the project's Prettier
config before committing:

```sh
npx prettier --write .
```

## Building

```sh
npm run build      # dist/windict-web/browser
npm run preview    # serves that folder
```

`ng build` prerenders every page once per language, into `en/`, `it/`, `es/` and `fr/`.
`scripts/postbuild.mjs` then adds what the root of the site needs:

- `index.html`, which sends visitors to `/it/`, `/es/`, `/fr/` or `/en/` by their browser's
  language (English without JavaScript);
- `404.html`, the prerendered "not found" page;
- `_redirects`, for paths without a language, like `/docs`;
- `_headers`, so hashed bundles are cached for good and pages are not;
- `sitemap.xml` and `robots.txt`.

## Deploying on Cloudflare Pages

| Setting                | Value                      |
| ---------------------- | -------------------------- |
| Framework preset       | None                       |
| Build command          | `npm run build`            |
| Build output directory | `dist/windict-web/browser` |

`.node-version` picks Node 24 for the build. Then add `windict.bosio.zip`
under the project's **Custom domains**.

## Translating

Every text is marked with `i18n` and an id (`i18n="@@home.hero.title"`), or
written with `$localize`. The translations are in `src/locale/messages.<locale>.json`: `it`, `es` and
`fr`.

After changing or adding text:

```sh
npm run extract-i18n
```

It writes the English messages to `src/locale/messages.json` and checks that
each translation file translates each of them, with the same placeholders, and
nothing that's no longer used. It also flags messages whose English changed
since they were translated: each file keeps that English under `source`. Once
their translations are updated, record the new English with
`node scripts/check-i18n.mjs --accept`.

The card in the home page's hero isn't translated this way: what it shows on
each language's page, a word from that language's dictionary, is in
`src/app/pages/home/hero-demo-content.ts`.

## Content

The pages are in `src/app/pages`: `home/` for the landing page, `docs/` for
the docs, whose table of contents is in `src/app/site.ts`. A new docs page
needs a template and a component in `docs/pages.ts`, an entry in `DOCS` and
a route in `app.routes.ts`.

The screenshots in `public/images` are cropped from WinDict's
`assets/intro/staging/reference`, in light and dark and at 960 and 1600 px
wide, and the page shows the one for the visitor's theme.

What the docs say should match WinDict itself: its shortcuts, settings and
numbers come from the app's source, so check them there when it changes.

## Credits

Icons are [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons)
(MIT), inlined in `src/app/shared/icons.ts`.

Bug reports and ideas about WinDict are welcome as
[issues](https://github.com/BosioPietro/WinDict/issues) on its repository.
