// Finishes the static site for Cloudflare Pages, after `ng build` has
// prerendered every page in dist/windict-web/browser/{en,it,es,fr,de,pt}:
//
// - one copy of the files in public/ (images, favicon, Open Graph image) at
//   the root, rather than one in each language;
// - 404.html in each language's folder, and the English one at the root: the
//   prerendered "not found" page, which Cloudflare serves for any path that
//   isn't a file;
// - _redirects, for paths without a language or a trailing slash, and the
//   old ones of the files;
// - _headers, for caching;
// - sitemap.xml and robots.txt;
// - and no index.csr.html, the client-side shells.
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

// Not found: each language's page, prerendered at /<locale>/404/, as
// <locale>/404.html, which Cloudflare serves for the paths in that language
// that aren't files; and the English one at the root, for the rest.
copyFileSync(join(out, 'en', '404', 'index.html'), join(out, '404.html'));
for (const l of LOCALES) {
  copyFileSync(join(out, l, '404', 'index.html'), join(out, l, '404.html'));
}

// The client-side shells Angular writes beside the prerendered pages: every
// page is prerendered, so nothing asks for them, and they'd be served as
// empty pages at /<locale>/index.csr.
for (const l of LOCALES) rmSync(join(out, l, 'index.csr.html'), { force: true });

// Paths without a language, the root among them, go to the English page:
// not to one guessed from the browser, as Google advises; the header's menu
// switches language, and search sends people to their own. The docs have no
// index: their first page stands in for it, without the page Angular writes
// for that redirect. Pages asked for without their trailing slash get it
// permanently, before Cloudflare's own redirect, which is temporary. And the
// files once in each language's folder go to their one copy at the root.
// Exact paths first, as Cloudflare finds those faster than the ones with
// placeholders; no path matches both kinds.
const fixed = (rule) => !/[:*]/.test(rule.split(' ')[0]);
writeFileSync(
  join(out, '_redirects'),
  [
    '/ /en/ 301',
    '/docs /en/docs/getting-started/ 301',
    '/docs/ /en/docs/getting-started/ 301',
    '/docs/:page /en/docs/:page/ 301',
    '/docs/:page/ /en/docs/:page/ 301',
    ...LOCALES.flatMap((l) => [
      `/${l} /${l}/ 301`,
      `/${l}/docs /${l}/docs/getting-started/ 301`,
      `/${l}/docs/ /${l}/docs/getting-started/ 301`,
      `/${l}/docs/:page /${l}/docs/:page/ 301`,
      ...FILES.map((name) => `/${l}/${name} /${name} 301`),
      ...FOLDERS.map((name) => `/${l}/${name}/* /${name}/:splat 301`),
    ]),
  ]
    .sort((a, b) => fixed(b) - fixed(a))
    .join('\n') + '\n',
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

// x-default: English, as on the pages.
const entry = (locale, path, modified) => `  <url>
    <loc>${url(locale, path)}</loc>${modified}
${LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en', path)}"/>
  </url>`;
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths
  .flatMap((path) => {
    const modified = lastmod(path);
    return LOCALES.map((locale) => entry(locale, path, modified));
  })
  .join('\n')}
</urlset>
`,
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`postbuild: ${paths.length} pages in ${LOCALES.length} languages, ready in ${out}`);
