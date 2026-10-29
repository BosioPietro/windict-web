// Checks each translation against the messages extracted from the
// templates (npm run extract-i18n): every message translated, none left
// over, the same placeholders in each, and none whose English changed since
// it was translated. Each messages.<locale>.json keeps that English under
// "source".
//
// After updating the translations of changed messages, record their new
// English with: node scripts/check-i18n.mjs --accept
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const path = (name) => new URL(`../src/locale/${name}`, import.meta.url);
const source = JSON.parse(readFileSync(path('messages.json'))).translations;
const files = readdirSync(path('')).filter((name) => /^messages\.[a-z]{2}\.json$/.test(name));
const placeholders = (text) => (text.match(/\{\$[A-Z0-9_]+\}/g) ?? []).sort().join(' ');
// Templates wrap text over lines: only the words count.
const words = (text = '') => text.replace(/\s+/g, ' ').trim();

let failed = false;
for (const file of files) {
  const translation = JSON.parse(readFileSync(path(file)));
  const target = translation.translations;

  if (process.argv.includes('--accept')) {
    translation.source = Object.fromEntries(
      Object.keys(target)
        .filter((id) => id in source)
        .map((id) => [id, source[id]]),
    );
    writeFileSync(path(file), JSON.stringify(translation, null, 2) + '\n');
    console.log(`${file}: recorded the English of every translation.`);
    continue;
  }

  const problems = [];
  for (const [id, text] of Object.entries(source)) {
    if (!(id in target)) problems.push(`missing: ${id}`);
    else if (placeholders(text) !== placeholders(target[id]))
      problems.push(`placeholders differ: ${id}`);
    else if (words(translation.source?.[id]) !== words(text))
      problems.push(`English changed: ${id}`);
  }
  for (const id of Object.keys(target)) {
    if (!(id in source)) problems.push(`no longer used: ${id}`);
  }

  if (problems.length) {
    failed = true;
    console.error(problems.map((p) => `${file}: ${p}`).join('\n'));
  } else console.log(`${file}: all ${Object.keys(source).length} messages translated.`);
}
if (failed) process.exit(1);
