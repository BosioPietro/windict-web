// Checks the Italian translation against the messages extracted from the
// templates (npm run extract-i18n): every message translated, none left
// over, the same placeholders in each, and none whose English changed since
// it was translated. messages.it.json keeps that English under "source".
//
// After updating the translations of changed messages, record their new
// English with: node scripts/check-i18n.mjs --accept
import { readFileSync, writeFileSync } from 'node:fs';

const path = (name) => new URL(`../src/locale/${name}`, import.meta.url);
const source = JSON.parse(readFileSync(path('messages.json'))).translations;
const italian = JSON.parse(readFileSync(path('messages.it.json')));
const target = italian.translations;
const placeholders = (text) => (text.match(/\{\$[A-Z0-9_]+\}/g) ?? []).sort().join(' ');
// Templates wrap text over lines: only the words count.
const words = (text = '') => text.replace(/\s+/g, ' ').trim();

if (process.argv.includes('--accept')) {
  italian.source = Object.fromEntries(
    Object.keys(target)
      .filter((id) => id in source)
      .map((id) => [id, source[id]]),
  );
  writeFileSync(path('messages.it.json'), JSON.stringify(italian, null, 2) + '\n');
  console.log('messages.it.json: recorded the English of every translation.');
  process.exit(0);
}

const problems = [];
for (const [id, text] of Object.entries(source)) {
  if (!(id in target)) problems.push(`missing: ${id}`);
  else if (placeholders(text) !== placeholders(target[id]))
    problems.push(`placeholders differ: ${id}`);
  else if (words(italian.source?.[id]) !== words(text)) problems.push(`English changed: ${id}`);
}
for (const id of Object.keys(target)) {
  if (!(id in source)) problems.push(`no longer used: ${id}`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`messages.it.json: all ${Object.keys(source).length} messages translated.`);
