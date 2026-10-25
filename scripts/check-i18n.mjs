// Checks the Italian translation against the messages extracted from the
// templates (npm run extract-i18n): every message translated, none left
// over, and the same placeholders in each.
import { readFileSync } from 'node:fs';

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../src/locale/${path}`, import.meta.url))).translations;
const source = read('messages.json');
const target = read('messages.it.json');
const placeholders = (text) => (text.match(/\{\$[A-Z0-9_]+\}/g) ?? []).sort().join(' ');

const problems = [];
for (const [id, text] of Object.entries(source)) {
  if (!(id in target)) problems.push(`missing: ${id}`);
  else if (placeholders(text) !== placeholders(target[id]))
    problems.push(`placeholders differ: ${id}`);
}
for (const id of Object.keys(target)) {
  if (!(id in source)) problems.push(`no longer used: ${id}`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`messages.it.json: all ${Object.keys(source).length} messages translated.`);
