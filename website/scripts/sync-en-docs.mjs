#!/usr/bin/env node
/**
 * Английские страницы доков — оригиналы Strudel из upstream/main.
 *
 * Каждая страница website/src/pages/<путь>.mdx апстрима копируется в website/src/pages/en/<путь>.mdx:
 * относительные импорты и layout сдвигаются на уровень глубже, внутренние ссылки на /en переписывает
 * relativeURLFix в astro.config.mjs. Страницы Bulka, которых нет в апстриме, переведены вручную и лежат
 * там же — скрипт их не трогает. Запускать после синка с апстримом (нужен remote upstream).
 *
 * Запуск: node website/scripts/sync-en-docs.mjs [ref]   (по умолчанию upstream/main)
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REF = process.argv[2] || 'upstream/main';
const PAGES = 'website/src/pages/';
const OUT = path.join(ROOT, 'website/src/pages/en');
// Немецкий воркшоп апстрима в Bulka не публикуется; англоязычный — да.
const SKIP = [/^de\//];

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const files = git('ls-tree', '-r', '--name-only', REF, PAGES)
  .split('\n')
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.slice(PAGES.length))
  .filter((f) => !SKIP.some((re) => re.test(f)));

const deeper = (text) =>
  text.replace(/(from\s+['"])((?:\.\.\/)+)/g, '$1../$2').replace(/^(layout:\s*)((?:\.\.\/)+)/m, '$1../$2');

// Broken links in upstream pages (relative paths without a leading slash). If upstream fixes one, the
// replacement stops matching and the script fails: drop that entry then.
const FIXUPS = {
  'learn/faq.mdx': [
    ['](learn/pwa/#using-strudel-offline)', '](/learn/pwa/#using-strudel-offline)'],
    ['](intro/#combining-patterns)', '](/learn/factories/#stack)'],
  ],
};

let written = 0;
for (const rel of files) {
  let text = git('show', `${REF}:${PAGES}${rel}`);
  for (const [from, to] of FIXUPS[rel] ?? []) {
    if (!text.includes(from)) throw new Error(`${rel}: upstream no longer has «${from}», remove the fixup`);
    text = text.split(from).join(to);
  }
  const sameDir = [...text.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)].map((m) => m[1]);
  text = deeper(text);
  for (const dep of sameDir) {
    const target = path.posix.relative(path.posix.dirname(`en/${rel}`), path.posix.join(path.posix.dirname(rel), dep));
    text = text.split(`'./${dep}'`).join(`'${target}'`).split(`"./${dep}"`).join(`"${target}"`);
  }
  // Upstream pages carry trailing spaces only inside code and tunes, where they mean nothing.
  text = text.replace(/[ \t]+$/gm, '');
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text);
  written++;
}
console.log(`[OK] ${written} English pages from ${REF} -> website/src/pages/en`);
