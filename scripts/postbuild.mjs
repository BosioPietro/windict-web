// Finishes the static site for Cloudflare Pages, after `ng build` has
// prerendered every page in dist/windict-web/browser/{en,it}:
//
// - index.html at the root, which sends visitors to /it/ or /en/ by their
//   browser's language;
// - 404.html, the prerendered "not found" page, which Pages serves for any
//   path that isn't a file;
// - _redirects, for paths without a language;
// - _headers, for caching;
// - sitemap.xml and robots.txt.
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://windict.bosio.zip';
const LOCALES = ['en', 'it'];
const out = fileURLToPath(new URL('../dist/windict-web/browser/', import.meta.url));

if (!LOCALES.every((l) => existsSync(join(out, l, 'index.html')))) {
  console.error(`postbuild: no prerendered pages in ${out}; run ng build first.`);
  process.exit(1);
}

// Root: pick the language. Without JavaScript, English. Its tags are for
// link previews of the bare domain, which don't follow the redirect.
const DESCRIPTION =
  'WinDict is a free Windows app for looking up and translating words: select a word in any app, press Alt+D, and its definition opens right next to it.';
writeFileSync(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>WinDict</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${DESCRIPTION}">
<meta property="og:title" content="WinDict · Look up and translate any word on Windows">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:url" content="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="WinDict">
<meta property="og:image" content="${SITE}/en/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${SITE}/en/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="it" href="${SITE}/it/">
<link rel="alternate" hreflang="x-default" href="${SITE}/en/">
<link rel="icon" href="/en/favicon.ico">
<script>
  (function () {
    var langs = navigator.languages || [navigator.language || ''];
    var it = String(langs[0] || '').toLowerCase().indexOf('it') === 0;
    location.replace((it ? '/it/' : '/en/') + location.search + location.hash);
  })();
</script>
<noscript><meta http-equiv="refresh" content="0; url=/en/"></noscript>
<style>body{font-family:"Segoe UI",system-ui,sans-serif;background:#f3f3f3;color:#1b1b1b;display:grid;place-items:center;min-height:100vh;margin:0}@media (prefers-color-scheme:dark){body{background:#1c1c1c;color:#fff}}a{color:inherit}</style>
</head>
<body>
<p><a href="/en/">English</a> · <a href="/it/" lang="it">Italiano</a></p>
</body>
</html>
`,
);

// Not found: the English page, prerendered at /en/404/.
copyFileSync(join(out, 'en', '404', 'index.html'), join(out, '404.html'));

// Paths without a language go to the English page; Italian visitors arrive
// through the root, which picks their language.
writeFileSync(
  join(out, '_redirects'),
  [
    '/docs /en/docs/getting-started/ 301',
    '/docs/* /en/docs/:splat 301',
    '/en/docs /en/docs/getting-started/ 301',
    '/it/docs /it/docs/getting-started/ 301',
    '',
  ].join('\n'),
);

// Hashed bundles never change; pages and images may.
writeFileSync(
  join(out, '_headers'),
  `/*.js
  Cache-Control: public, max-age=31536000, immutable
/*.css
  Cache-Control: public, max-age=31536000, immutable
/*/images/*
  Cache-Control: public, max-age=604800
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`,
);

// Sitemap: every prerendered page, with its other-language twin.
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
  .filter((p) => p !== '404' && existsSync(join(out, 'it', p, 'index.html')))
  .sort();
const url = (locale, path) => `${SITE}/${locale}/${path ? `${path}/` : ''}`;
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths
  .flatMap((path) =>
    LOCALES.map(
      (locale) => `  <url>
    <loc>${url(locale, path)}</loc>
${LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`).join('\n')}
  </url>`,
    ),
  )
  .join('\n')}
</urlset>
`,
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`postbuild: ${paths.length} pages in ${LOCALES.length} languages, ready in ${out}`);
