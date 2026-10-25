# windict-web

The website of [WinDict](https://github.com/BosioPietro/WinDict), at
[windict.bosio.zip](https://windict.bosio.zip): a landing page and the docs,
in English and Italian.

It's an Angular app, styled with Tailwind CSS after Microsoft's Fluent 2
design, and prerendered to static pages (Angular SSG) for Cloudflare Pages.

## Developing

Needs Node.js 22.22.3 or newer (`.node-version` asks for 24).

```sh
npm install
npm start          # http://localhost:4200, in English
npm run start:it   # the same, in Italian
```

## Building

```sh
npm run build      # dist/windict-web/browser
npm run preview    # serves that folder
```

`ng build` prerenders every page once per language, into `en/` and `it/`.
`scripts/postbuild.mjs` then adds what the root of the site needs: an
`index.html` that sends visitors to `/it/` or `/en/` by their browser's
language, `404.html`, `_redirects`, `_headers`, `sitemap.xml` and
`robots.txt`.

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
written with `$localize`. The Italian is in `src/locale/messages.it.json`.

After changing or adding text:

```sh
npm run extract-i18n
```

It writes the English messages to `src/locale/messages.json` and checks that
`messages.it.json` translates each of them, with the same placeholders, and
nothing that's no longer used.

## Content

The pages are in `src/app/pages`: `home/` for the landing page, `docs/` for
the docs, whose table of contents is in `src/app/site.ts`. The screenshots in
`public/images` are cropped from WinDict's `assets/intro/staging/reference`,
in light and dark, and the page shows the one for the visitor's theme.

Icons are [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons)
(MIT), inlined in `src/app/shared/icons.ts`.
