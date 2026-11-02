// Finishes the static site for Cloudflare Pages, after `ng build` has
// prerendered every page in dist/windict-web/browser/{en,it,es,fr,de,pt}:
//
// - one copy of the files in public/ (images, favicon, Open Graph image) at
//   the root, rather than one in each language;
// - index.html at the root, which sends visitors to their browser's
//   language, or to /en/, and is the home page's x-default;
// - 404.html, the prerendered "not found" page, which Pages serves for any
//   path that isn't a file;
// - _redirects, for paths without a language, and the old ones of the files;
// - _headers, for caching;
// - sitemap.xml and robots.txt.
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://windict.bosio.zip';
const LOCALES = ['en', 'it', 'es', 'fr', 'de', 'pt'];
/** Each language, named in itself, for the root page's links. */
const NAMES = {
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
};
const root = fileURLToPath(new URL('../', import.meta.url));
const out = join(root, 'dist', 'windict-web', 'browser');

if (!LOCALES.every((l) => existsSync(join(out, l, 'index.html')))) {
  console.error(`postbuild: no prerendered pages in ${out}; run ng build first.`);
  process.exit(1);
}

// The files in public/, which Angular copies into every language: one copy
// at the root instead, where the pages ask for them (/images/..., /og.jpg).
const PUBLIC = readdirSync(join(root, 'public'));
for (const name of PUBLIC) {
  rmSync(join(out, name), { recursive: true, force: true });
  renameSync(join(out, 'en', name), join(out, name));
  for (const l of LOCALES) rmSync(join(out, l, name), { recursive: true, force: true });
}
const FILES = PUBLIC.filter((name) => statSync(join(out, name)).isFile());
const FOLDERS = PUBLIC.filter((name) => !FILES.includes(name));

// Root: pick the language. Without JavaScript, English. It's the home
// page's x-default, as Google suggests for a page that picks the language,
// so it's canonical itself; its other tags are for link previews of the
// bare domain, which don't follow the redirect. Its words are the English
// home page's, as the build wrote them (escaped already).
const home = readFileSync(join(out, 'en', 'index.html'), 'utf8').split('</head>')[0];
const tag = (pattern) => {
  const found = home.match(pattern)?.[1];
  if (!found) throw new Error(`postbuild: no ${pattern} in en/index.html`);
  return found;
};
const TITLE = tag(/<title>([^<]*)<\/title>/);
const DESCRIPTION = tag(/<meta name="description" content="([^"]*)"/);
const IMAGE_ALT = tag(/<meta property="og:image:alt" content="([^"]*)"/);
writeFileSync(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${TITLE}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${DESCRIPTION}">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:url" content="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="WinDict">
<meta property="og:image" content="${SITE}/og.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${IMAGE_ALT}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image:alt" content="${IMAGE_ALT}">
<link rel="canonical" href="${SITE}/">
${LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}/">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" href="/windict-180.png">
<script>
  (function () {
    var locales = ${JSON.stringify(LOCALES)};
    var langs = navigator.languages || [navigator.language || ''];
    var first = String(langs[0] || '').toLowerCase().slice(0, 2);
    var locale = locales.indexOf(first) >= 0 ? first : 'en';
    location.replace('/' + locale + '/' + location.search + location.hash);
  })();
</script>
<noscript><meta http-equiv="refresh" content="0; url=/en/"></noscript>
<style>body{font-family:"Segoe UI",system-ui,sans-serif;background:#f3f3f3;color:#1b1b1b;display:grid;place-items:center;min-height:100vh;margin:0}@media (prefers-color-scheme:dark){body{background:#1c1c1c;color:#fff}}a{color:inherit}</style>
</head>
<body>
<p>${LOCALES.map((l) => `<a href="/${l}/" lang="${l}">${NAMES[l]}</a>`).join(' · ')}</p>
</body>
</html>
`,
);

// Not found: the English page, prerendered at /en/404/.
copyFileSync(join(out, 'en', '404', 'index.html'), join(out, '404.html'));

// Paths without a language go to the English page; visitors in the other
// languages arrive through the root, which picks theirs. The docs have no
// index: their first page stands in for it, without the page Angular writes
// for that redirect. And the files once in each language's folder go to
// their one copy at the root.
writeFileSync(
  join(out, '_redirects'),
  [
    '/docs /en/docs/getting-started/ 301',
    '/docs/ /en/docs/getting-started/ 301',
    '/docs/:page /en/docs/:page/ 301',
    '/docs/:page/ /en/docs/:page/ 301',
    ...LOCALES.flatMap((l) => [
      `/${l}/docs /${l}/docs/getting-started/ 301`,
      `/${l}/docs/ /${l}/docs/getting-started/ 301`,
      ...FILES.map((name) => `/${l}/${name} /${name} 301`),
      ...FOLDERS.map((name) => `/${l}/${name}/* /${name}/:splat 301`),
    ]),
    '',
  ].join('\n'),
);

// Hashed bundles never change; images and icons rarely do; pages may.
writeFileSync(
  join(out, '_headers'),
  `/*.js
  Cache-Control: public, max-age=31536000, immutable
/*.css
  Cache-Control: public, max-age=31536000, immutable
${[...FOLDERS.map((name) => `/${name}/*`), ...FILES.map((name) => `/${name}`)]
  .map((path) => `${path}\n  Cache-Control: public, max-age=604800`)
  .join('\n')}
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`,
);

// Sitemap: every prerendered page, with its twins in the other languages.
const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    // Not the pages Angular writes for redirects, such as /docs/.
    else if (
      name === 'index.html' &&
      !readFileSync(path, 'utf8').includes('<title>Redirecting</title>')
    )
      pages.push(relative(join(out, 'en'), dir).split(sep).join('/'));
  }
};
walk(join(out, 'en'));
const paths = pages
  .filter((p) => p !== '404' && LOCALES.every((l) => existsSync(join(out, l, p, 'index.html'))))
  .sort();
const url = (locale, path) => `${SITE}/${locale}/${path ? `${path}/` : ''}`;

/**
 * When a page last changed: the last commit to its source, as git has it.
 * Nothing when git isn't there to ask, as in a copy of the files alone.
 */
const lastmod = (path) => {
  const source = path === '' ? 'src/app/pages/home' : `src/app/pages/${path}.html`;
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cI', '--', source], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return date ? `\n    <lastmod>${date}</lastmod>` : '';
  } catch {
    return '';
  }
};

const entry = (loc, path, xDefault, modified) => `  <url>
    <loc>${loc}</loc>${modified}
${LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}"/>
  </url>`;
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths
  .flatMap((path) => {
    // The home page's x-default is the root, which is in the sitemap too.
    const xDefault = path === '' ? `${SITE}/` : url('en', path);
    const modified = lastmod(path);
    return [
      ...(path === '' ? [entry(`${SITE}/`, path, xDefault, modified)] : []),
      ...LOCALES.map((locale) => entry(url(locale, path), path, xDefault, modified)),
    ];
  })
  .join('\n')}
</urlset>
`,
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`postbuild: ${paths.length} pages in ${LOCALES.length} languages, ready in ${out}`);
