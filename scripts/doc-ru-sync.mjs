#!/usr/bin/env node
/**
 * Собирает русский справочник doc.json из свежей английской структуры doc.en.json.
 *
 * doc.en.json генерируется из JSDoc движка (`pnpm jsdoc-json`) и задаёт состав функций, примеры и
 * синонимы. Из текущего doc.json переносятся русские тексты (description и описания параметров) —
 * по longname, а если функция переехала или переименована, то по имени или синониму.
 *
 * Запуск: node scripts/doc-ru-sync.mjs
 * Код выхода 1 и список, если у каких-то записей остался английский текст: переведи их прямо в
 * doc.json и запусти снова.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EN_PATH = path.join(ROOT, 'doc.en.json');
const RU_PATH = path.join(ROOT, 'doc.json');

const hasCyrillic = (s) => /[Ѐ-ӿ]/.test(s ?? '');
const needsText = (s) => /[A-Za-z]{2}/.test((s ?? '').replace(/<[^>]*>|`[^`]*`/g, ''));

function indexRussian(docs) {
  const byLong = new Map();
  const byName = new Map();
  for (const d of docs) {
    byLong.set(d.longname, d);
    for (const n of [d.name, ...(d.synonyms ?? [])]) {
      if (n && !byName.has(n)) byName.set(n, d);
    }
  }
  return { byLong, byName };
}

function findRussian(entry, index) {
  const exact = index.byLong.get(entry.longname);
  if (exact) return exact;
  for (const n of [entry.name, ...(entry.synonyms ?? [])]) {
    const hit = index.byName.get(n);
    if (hit) return hit;
  }
  return null;
}

function carry(entry, ru) {
  const out = structuredClone(entry);
  if (!ru) return out;
  if (hasCyrillic(ru.description)) out.description = ru.description;
  if (out.params && ru.params) {
    const ruParams = new Map(ru.params.map((p) => [p.name, p]));
    for (const p of out.params) {
      const r = ruParams.get(p.name);
      if (r && hasCyrillic(r.description)) p.description = r.description;
    }
  }
  return out;
}

function pending(entry) {
  const missing = [];
  if (needsText(entry.description) && !hasCyrillic(entry.description)) missing.push('description');
  for (const p of entry.params ?? []) {
    if (needsText(p.description) && !hasCyrillic(p.description)) missing.push(`param ${p.name}`);
  }
  return missing;
}

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
const ru = JSON.parse(fs.readFileSync(RU_PATH, 'utf8'));
const index = indexRussian(ru.docs);
const docs = en.docs.map((entry) => carry(entry, findRussian(entry, index)));
fs.writeFileSync(RU_PATH, JSON.stringify({ ...en, docs }, null, 2) + '\n');

const left = docs.map((d) => [d.longname, pending(d)]).filter(([, m]) => m.length);
console.log(`doc.json: ${docs.length} записей (было ${ru.docs.length}), без перевода: ${left.length}`);
if (left.length) {
  for (const [name, missing] of left) console.log(`  ${name}: ${missing.join(', ')}`);
  process.exit(1);
}
